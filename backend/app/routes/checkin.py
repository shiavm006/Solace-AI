from fastapi import APIRouter, HTTPException, status, Depends, UploadFile, File, Form, BackgroundTasks, Query, Header, Request
from fastapi.responses import FileResponse
from typing import Optional
from datetime import datetime, timedelta
from collections import Counter
from app.schemas.checkin import CheckInResponse, TaskStatus, CheckInDetail
from app.database import get_checkins_collection, get_tasks_collection, get_users_collection
from app.utils.auth import get_current_active_user
from jose import jwt, JWTError
from app.config import settings
from app.schemas.user import UserResponse
from app.services.video_ml import analyze_video_frames
from app.services.pdf_generator import generate_checkin_pdf
from app.services.llm_insights import generate_insights
from slowapi import Limiter
from slowapi.util import get_remote_address
import uuid
import os
import shutil
from pathlib import Path
import logging

logger = logging.getLogger(__name__)

limiter = Limiter(key_func=get_remote_address)

router = APIRouter()

VIDEOS_DIR = Path(settings.VIDEOS_DIR)
VIDEOS_DIR.mkdir(parents=True, exist_ok=True)

async def get_employee_name(emp_id: str) -> tuple[str, str]:
    """
    Get employee name from database by ID
    
    Args:
        emp_id: Employee ID (string or ObjectId)
        
    Returns:
        tuple: (full_name, email) - Full name and email of the employee
    """
    from bson import ObjectId
    users_collection = get_users_collection()
    
    try:
        user_doc = await users_collection.find_one({"_id": ObjectId(emp_id)})
    except Exception:
        user_doc = await users_collection.find_one({"_id": emp_id})
    
    if user_doc:
        first_name = user_doc.get("first_name", "")
        last_name = user_doc.get("last_name", "")
        full_name = f"{first_name} {last_name}".strip() or "Employee"
        email = user_doc.get("email", "")
        return full_name, email
    
    logger.warning(f"No user found for emp_id: {emp_id}")
    return "Employee", ""

async def cleanup_video_file(video_path: str, max_retries: int = 3) -> bool:
    """
    Delete video file with retry logic
    
    Args:
        video_path: Path to video file
        max_retries: Maximum number of deletion attempts
        
    Returns:
        bool: True if deleted successfully, False otherwise
    """
    import asyncio
    
    for attempt in range(max_retries):
        try:
            if os.path.exists(video_path):
                os.remove(video_path)
                logger.info(f"Deleted video after processing: {video_path}")
                return True
            else:
                logger.warning(f"Video file not found for deletion: {video_path}")
                return False
        except PermissionError as e:
            logger.warning(f"Permission error deleting video (attempt {attempt + 1}/{max_retries}): {e}")
            if attempt < max_retries - 1:
                await asyncio.sleep(1)
                continue
        except Exception as e:
            logger.error(f"Error deleting video (attempt {attempt + 1}/{max_retries}): {e}")
            if attempt < max_retries - 1:
                await asyncio.sleep(1)
                continue
    
    logger.error(f"Failed to delete video after {max_retries} attempts: {video_path}")
    return False

async def get_user_from_token_or_header(
    token: Optional[str] = Query(None),
    authorization: Optional[str] = Header(None)
) -> UserResponse:
    """
    Get current user from either query parameter token or Authorization header
    Used for PDF downloads where browsers need query params
    """
    
    if token:
        token_str = token
    elif authorization and authorization.startswith("Bearer "):
        token_str = authorization.split(" ")[1]
    else:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated"
        )
    
    try:
        payload = jwt.decode(token_str, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email = payload.get("sub")
        if not email:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token"
            )
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials"
        )
    
    users_collection = get_users_collection()
    user = await users_collection.find_one({"email": email})
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )
    
    return UserResponse(
        id=str(user["_id"]),
        email=user["email"],
        first_name=user.get("first_name", ""),
        last_name=user.get("last_name", ""),
        role=user.get("role", "employee"),
        is_active=user.get("is_active", True),
        created_at=user.get("created_at", datetime.utcnow()),
        updated_at=user.get("updated_at", datetime.utcnow())
    )

async def process_video_task(task_id: str, video_path: str, emp_id: str, emp_email: str, notes: Optional[str]):
    """
    Background task to process video
    - Extracts metrics using ML pipeline
    - Generates PDF report
    - Deletes video immediately after successful processing
    """
    tasks_collection = get_tasks_collection()
    checkins_collection = get_checkins_collection()
    
    try:
        await tasks_collection.update_one(
            {"task_id": task_id},
            {"$set": {
                "status": "processing",
                "progress": 10,
                "message": "Extracting video frames...",
                "updated_at": datetime.utcnow()
            }}
        )
        
        logger.info(f"Starting ML analysis for task {task_id}")
        
        await tasks_collection.update_one(
            {"task_id": task_id},
            {"$set": {
                "progress": 30,
                "message": "Analyzing video with MediaPipe FaceMesh...",
                "updated_at": datetime.utcnow()
            }}
        )
        
        try:
            face_metrics = await analyze_video_frames(video_path)
            logger.info(f"Video analysis complete: {face_metrics}")
        except Exception as e:
            logger.error(f"Video analysis failed: {e}")
            face_metrics = {
                "stress_avg": 0,
                "yawns_count": 0,
                "dress_compliance": 0,
                "duration_seconds": 0,
                "face_detected": False,
                "error": str(e)
            }
        
        await tasks_collection.update_one(
            {"task_id": task_id},
            {"$set": {"status": "processing", "progress": 40, "message": "Analyzing audio and transcript...", "updated_at": datetime.utcnow()}}
        )
        
        try:
            from app.services.audio_ml import analyze_audio
            audio_metrics = await analyze_audio(video_path)
            logger.info(f"Audio analysis complete: {audio_metrics.get('word_count')} words transcribed")
        except Exception as e:
            logger.error(f"Audio analysis failed: {e}")
            audio_metrics = {
                "transcript": "",
                "word_count": 0,
                "speaking_pace_wpm": 0,
                "voice_energy": 0,
                "pitch_variance": 0,
                "pauses_count": 0,
                "sentiment": "neutral",
                "duration_seconds": 0,
                "has_audio": False,
                "error": str(e)
            }
        
        employee_name, _ = await get_employee_name(emp_id)
        
        combined_metrics = {
            **face_metrics,
            "audio": audio_metrics
        }
        
        logger.info(f"Generating LLM insights for {employee_name}")
        insights_result = await generate_insights(
            metrics=combined_metrics,
            notes=notes,
            employee_name=employee_name
        )
        
        # New structure: qualitative insights (full narrative sections)
        logger.info(f"LLM insights generated successfully: {len(insights_result.get('recommendations', []))} recommendations")
        
        checkin_doc = {
            "emp_id": emp_id,
            "emp_email": emp_email,
            "task_id": task_id,
            "video_path": None,
            "status": "completed",
            "date": datetime.utcnow(),
            "notes": notes,
            "metrics": combined_metrics,
            "insights": insights_result,  # Store all qualitative insights sections
            "pdf_url": None,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        result = await checkins_collection.insert_one(checkin_doc)
        checkin_doc["_id"] = result.inserted_id
        
        pdf_path = None
        try:
            emp_name, _ = await get_employee_name(emp_id)
            
            pdf_path = await generate_checkin_pdf(checkin_doc, emp_name, emp_email)
            
            await checkins_collection.update_one(
                {"_id": result.inserted_id},
                {"$set": {"pdf_url": pdf_path, "updated_at": datetime.utcnow()}}
            )
            
            logger.info(f"PDF generated and saved: {pdf_path}")
        except Exception as pdf_error:
            logger.error(f"Failed to generate PDF: {pdf_error}", exc_info=True)
        
        video_deleted = await cleanup_video_file(video_path)
        
        await tasks_collection.update_one(
            {"task_id": task_id},
            {"$set": {
                "status": "completed",
                "progress": 100,
                "message": "Video processing complete, video deleted",
                "result": {
                    "checkin_id": str(checkin_doc["_id"]),
                    "metrics": checkin_doc["metrics"],
                    "video_deleted": video_deleted
                },
                "updated_at": datetime.utcnow()
            }}
        )
        
    except Exception as e:
        logger.error(f"❌ Processing failed for {video_path}, keeping video for debugging: {e}", exc_info=True)
        logger.info(f"Failed video retained at: {video_path} for debugging")
        
        await tasks_collection.update_one(
            {"task_id": task_id},
            {"$set": {
                "status": "failed",
                "message": f"Error processing video: {str(e)}",
                "video_path": video_path,
                "updated_at": datetime.utcnow()
            }}
        )

@router.post("/daily-checkin", response_model=CheckInResponse)
@limiter.limit("5/hour")
async def upload_daily_checkin(
    request: Request,
    background_tasks: BackgroundTasks,
    video: UploadFile = File(...),
    notes: Optional[str] = Form(None),
    today: Optional[str] = Form(None),
    blockers: Optional[str] = Form(None),
    tomorrow: Optional[str] = Form(None),
    current_user: UserResponse = Depends(get_current_active_user)
):
    """
    Upload daily check-in video
    - Accepts video file (mp4, webm, avi, mov)
    - Saves to temporary storage
    - Starts background processing task
    - Returns task_id for status polling
    """
    
    ALLOWED_CONTENT_TYPES = ["video/mp4", "video/webm", "video/x-matroska", "video/quicktime", "video/x-msvideo"]
    ALLOWED_EXTENSIONS = ["mp4", "webm", "mkv", "mov", "avi"]
    
    if not video.content_type or video.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file type. Allowed types: {', '.join(ALLOWED_CONTENT_TYPES)}"
        )
    
    if not video.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Filename is required"
        )
    
    safe_filename = os.path.basename(video.filename)
    file_extension = safe_filename.split(".")[-1].lower() if "." in safe_filename else ""
    
    if not file_extension or file_extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file extension. Allowed extensions: {', '.join(ALLOWED_EXTENSIONS)}"
        )
    
    MAX_FILE_SIZE = settings.MAX_FILE_SIZE_MB * 1024 * 1024
    video.file.seek(0, 2)
    file_size = video.file.tell()
    video.file.seek(0)
    
    if file_size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Video file too large ({file_size / (1024*1024):.1f}MB). Maximum: {settings.MAX_FILE_SIZE_MB}MB"
        )
    
    if file_size < 1024:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Video file appears to be empty or corrupted"
        )
    
    task_id = str(uuid.uuid4())
    video_filename = f"{task_id}.{file_extension}"
    video_path = VIDEOS_DIR / video_filename
    
    try:
        video_path = video_path.resolve()
        if not str(video_path).startswith(str(VIDEOS_DIR.resolve())):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid file path"
            )
    except Exception as e:
        logger.error(f"Path validation error: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file path"
        )
    
    try:
        with open(video_path, "wb") as buffer:
            shutil.copyfileobj(video.file, buffer)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save video: {str(e)}"
        )
    
    tasks_collection = get_tasks_collection()
    task_doc = {
        "task_id": task_id,
        "emp_id": current_user.id,
        "emp_email": current_user.email,
        "status": "queued",
        "progress": 0,
        "message": "Video uploaded, queued for processing",
        "result": None,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    await tasks_collection.insert_one(task_doc)
    
    combined_notes = f"{notes or ''}\n\nToday: {today or ''}\nBlockers: {blockers or ''}\nTomorrow: {tomorrow or ''}"
    background_tasks.add_task(
        process_video_task,
        task_id,
        str(video_path),
        current_user.id,
        current_user.email,
        combined_notes.strip()
    )
    
    return CheckInResponse(
        task_id=task_id,
        status="queued",
        message="Video uploaded successfully. Processing started."
    )

@router.get("/status/{task_id}", response_model=TaskStatus)
async def get_task_status(
    task_id: str,
    current_user: UserResponse = Depends(get_current_active_user)
):
    """
    Get status of a processing task
    Used for polling by frontend
    """
    tasks_collection = get_tasks_collection()
    
    task = await tasks_collection.find_one({"task_id": task_id})
    
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    if task["emp_id"] != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    return TaskStatus(
        task_id=task["task_id"],
        status=task["status"],
        progress=task.get("progress"),
        message=task.get("message"),
        result=task.get("result"),
        created_at=task["created_at"],
        updated_at=task["updated_at"]
    )

@router.get("/my-checkins")
async def get_my_checkins(
    page: int = Query(default=1, ge=1, description="Page number (1-indexed)"),
    page_size: int = Query(default=20, ge=1, le=100, description="Items per page (max 100)"),
    current_user: UserResponse = Depends(get_current_active_user)
):
    """
    Get check-ins for current user with pagination
    
    Args:
        page: Page number (1-indexed)
        page_size: Number of items per page (1-100)
        
    Returns:
        Paginated list of check-ins with metadata
    """
    checkins_collection = get_checkins_collection()
    
    skip = (page - 1) * page_size
    
    total_count = await checkins_collection.count_documents({"emp_id": current_user.id})
    
    checkins = await checkins_collection.find(
        {"emp_id": current_user.id}
    ).sort("created_at", -1).skip(skip).limit(page_size).to_list(page_size)
    
    result = []
    for checkin in checkins:
        checkin["id"] = str(checkin["_id"])
        del checkin["_id"]
        result.append(checkin)
    
    total_pages = (total_count + page_size - 1) // page_size
    
    return {
        "checkins": result,
        "pagination": {
            "page": page,
            "page_size": page_size,
            "total_count": total_count,
            "total_pages": total_pages,
            "has_next": page < total_pages,
            "has_prev": page > 1
        }
    }

@router.get("/download-pdf/{checkin_id}")
async def download_pdf(
    checkin_id: str,
    current_user: UserResponse = Depends(get_user_from_token_or_header)
):
    """
    Download PDF report for a specific check-in
    Supports both Authorization header and token query param
    """
    checkins_collection = get_checkins_collection()
    
    from bson import ObjectId
    try:
        checkin = await checkins_collection.find_one({"_id": ObjectId(checkin_id)})
    except:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid check-in ID"
        )
    
    if not checkin:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Check-in not found"
        )
    
    # Allow access if user owns the check-in or is an admin
    if checkin["emp_id"] != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    pdf_path = checkin.get("pdf_url")
    if not pdf_path or not os.path.exists(pdf_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="PDF report not found"
        )
    
    return FileResponse(
        path=pdf_path,
        media_type="application/pdf",
        filename=f"checkin_report_{checkin_id}.pdf"
    )


@router.get("/all-checkins")
async def get_all_checkins(
    page: int = Query(default=1, ge=1, description="Page number (1-indexed)"),
    page_size: int = Query(default=5, ge=1, le=100, description="Items per page (max 100)"),
    current_user: UserResponse = Depends(get_current_active_user)
):
    """
    Get all check-ins for admin users with employee information
    
    Args:
        page: Page number (1-indexed)
        page_size: Number of items per page (1-100)
        current_user: Current authenticated user (must be admin)
        
    Returns:
        Paginated list of all check-ins with employee names
    """
    # Only allow admins
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can access all check-ins"
        )
    
    checkins_collection = get_checkins_collection()
    users_collection = get_users_collection()
    
    skip = (page - 1) * page_size
    
    total_count = await checkins_collection.count_documents({})
    
    checkins = await checkins_collection.find({}).sort("created_at", -1).skip(skip).limit(page_size).to_list(page_size)
    
    result = []
    for checkin in checkins:
        # Get employee information
        employee_name = None
        employee_email = None
        if "emp_id" in checkin:
            try:
                from bson import ObjectId
                employee = await users_collection.find_one({"_id": ObjectId(checkin["emp_id"])})
                if employee:
                    employee_name = f"{employee.get('first_name', '')} {employee.get('last_name', '')}".strip()
                    employee_email = employee.get('email', '')
            except:
                pass
        
        checkin_data = {
            "id": str(checkin["_id"]),
            "task_id": checkin.get("task_id", ""),
            "status": checkin.get("status", "unknown"),
            "date": checkin.get("date", ""),
            "created_at": checkin.get("created_at", "").isoformat() if isinstance(checkin.get("created_at"), datetime) else str(checkin.get("created_at", "")),
            "pdf_url": checkin.get("pdf_url"),
            "emp_id": checkin.get("emp_id", ""),
            "employee_name": employee_name,
            "employee_email": employee_email,
        }
        result.append(checkin_data)
    
    return {
        "checkins": result,
        "total": total_count,
        "page": page,
        "page_size": page_size,
        "total_pages": (total_count + page_size - 1) // page_size
    }


@router.get("/dashboard-metrics")
async def get_dashboard_metrics(
    current_user: UserResponse = Depends(get_current_active_user)
):
    """
    Get aggregated dashboard metrics for admin users
    
    Returns:
        Dictionary with wellness metrics, employee stats, and trends
    """
    # Only allow admins
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can access dashboard metrics"
        )
    
    checkins_collection = get_checkins_collection()
    users_collection = get_users_collection()
    
    # Get all employees
    total_employees = await users_collection.count_documents({"role": "employee"})
    
    # Get check-ins from last 30 days
    thirty_days_ago = datetime.now() - timedelta(days=30)
    
    recent_checkins = await checkins_collection.find({
        "created_at": {"$gte": thirty_days_ago}
    }).to_list(1000)
    
    # Calculate metrics
    stress_scores = []
    engagement_scores = []
    emotions = []
    active_employee_ids = set()
    at_risk_count = 0
    
    for checkin in recent_checkins:
        metrics = checkin.get("metrics", {})
        
        # Stress and engagement
        stress_avg = metrics.get("stress_avg", 0)
        engagement = metrics.get("engagement_score", 0)
        
        if stress_avg > 0:
            stress_scores.append(stress_avg)
        if engagement > 0:
            engagement_scores.append(engagement)
        
        # Track active employees
        if "emp_id" in checkin:
            active_employee_ids.add(checkin["emp_id"])
        
        # At-risk: high stress (>70) or low engagement (<50)
        if stress_avg > 70 or engagement < 50:
            at_risk_count += 1
        
        # Emotions from audio
        audio = metrics.get("audio", {})
        if audio.get("dominant_emotion"):
            emotions.append(audio["dominant_emotion"])
    
    # Calculate averages
    avg_stress = sum(stress_scores) / len(stress_scores) if stress_scores else 0
    avg_engagement = sum(engagement_scores) / len(engagement_scores) if engagement_scores else 0
    
    # Calculate wellness score (inverse of stress, weighted with engagement)
    # Wellness = (100 - stress) * 0.6 + engagement * 0.4
    wellness_score = ((100 - avg_stress) * 0.6 + avg_engagement * 0.4) if stress_scores or engagement_scores else 0
    
    # Get most common emotion
    emotion_counts = Counter(emotions)
    dominant_emotion = emotion_counts.most_common(1)[0][0] if emotion_counts else "neutral"
    
    # Get check-ins this week and month
    week_ago = datetime.now() - timedelta(days=7)
    checkins_this_week = await checkins_collection.count_documents({
        "created_at": {"$gte": week_ago}
    })
    checkins_this_month = len(recent_checkins)
    
    # Calculate completion rate (employees who checked in today)
    today = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
    today_checkins = await checkins_collection.count_documents({
        "created_at": {"$gte": today}
    })
    completion_rate = (today_checkins / total_employees * 100) if total_employees > 0 else 0
    
    # Get stress trend (last 7 days)
    stress_trend = []
    for i in range(6, -1, -1):
        day_start = (datetime.now() - timedelta(days=i)).replace(hour=0, minute=0, second=0, microsecond=0)
        day_end = day_start + timedelta(days=1)
        day_checkins = await checkins_collection.find({
            "created_at": {"$gte": day_start, "$lt": day_end}
        }).to_list(100)
        
        day_stress = []
        for c in day_checkins:
            s = c.get("metrics", {}).get("stress_avg", 0)
            if s > 0:
                day_stress.append(s)
        
        avg_day_stress = sum(day_stress) / len(day_stress) if day_stress else 0
        stress_trend.append(round(avg_day_stress))
    
    # Get engagement trend (last 7 days)
    engagement_trend = []
    for i in range(6, -1, -1):
        day_start = (datetime.now() - timedelta(days=i)).replace(hour=0, minute=0, second=0, microsecond=0)
        day_end = day_start + timedelta(days=1)
        day_checkins = await checkins_collection.find({
            "created_at": {"$gte": day_start, "$lt": day_end}
        }).to_list(100)
        
        day_engagement = []
        for c in day_checkins:
            e = c.get("metrics", {}).get("engagement_score", 0)
            if e > 0:
                day_engagement.append(e)
        
        avg_day_engagement = sum(day_engagement) / len(day_engagement) if day_engagement else 0
        engagement_trend.append(round(avg_day_engagement))
    
    # Calculate percentage changes (compare current period with previous period)
    # Current period: last 7 days
    # Previous period: 7 days before that (days 8-14)
    
    # Current period (last 7 days)
    current_week_start = (datetime.now() - timedelta(days=7)).replace(hour=0, minute=0, second=0, microsecond=0)
    current_week_checkins = await checkins_collection.find({
        "created_at": {"$gte": current_week_start}
    }).to_list(1000)
    
    current_stress_scores = []
    current_engagement_scores = []
    for c in current_week_checkins:
        m = c.get("metrics", {})
        s = m.get("stress_avg", 0)
        e = m.get("engagement_score", 0)
        if s > 0:
            current_stress_scores.append(s)
        if e > 0:
            current_engagement_scores.append(e)
    
    current_avg_stress = sum(current_stress_scores) / len(current_stress_scores) if current_stress_scores else avg_stress
    current_avg_engagement = sum(current_engagement_scores) / len(current_engagement_scores) if current_engagement_scores else avg_engagement
    current_wellness = ((100 - current_avg_stress) * 0.6 + current_avg_engagement * 0.4) if current_stress_scores or current_engagement_scores else wellness_score
    
    # Previous period (7 days before that, days 8-14)
    prev_week_start = (datetime.now() - timedelta(days=14)).replace(hour=0, minute=0, second=0, microsecond=0)
    prev_week_end = current_week_start
    prev_week_checkins = await checkins_collection.find({
        "created_at": {"$gte": prev_week_start, "$lt": prev_week_end}
    }).to_list(1000)
    
    prev_stress_scores = []
    prev_engagement_scores = []
    for c in prev_week_checkins:
        m = c.get("metrics", {})
        s = m.get("stress_avg", 0)
        e = m.get("engagement_score", 0)
        if s > 0:
            prev_stress_scores.append(s)
        if e > 0:
            prev_engagement_scores.append(e)
    
    prev_avg_stress = sum(prev_stress_scores) / len(prev_stress_scores) if prev_stress_scores else current_avg_stress
    prev_avg_engagement = sum(prev_engagement_scores) / len(prev_engagement_scores) if prev_engagement_scores else current_avg_engagement
    prev_wellness = ((100 - prev_avg_stress) * 0.6 + prev_avg_engagement * 0.4) if prev_stress_scores or prev_engagement_scores else current_wellness
    
    # Calculate percentage changes
    # For stress: negative change is good (stress decreased)
    if prev_avg_stress > 0:
        stress_change = round(((prev_avg_stress - current_avg_stress) / prev_avg_stress) * 100, 1)
    else:
        stress_change = 0
    
    # For engagement: positive change is good (engagement increased)
    if prev_avg_engagement > 0:
        engagement_change = round(((current_avg_engagement - prev_avg_engagement) / prev_avg_engagement) * 100, 1)
    else:
        engagement_change = 0
    
    # For wellness: positive change is good (wellness increased)
    if prev_wellness > 0:
        wellness_change = round(((current_wellness - prev_wellness) / prev_wellness) * 100, 1)
    else:
        wellness_change = 0
    
    return {
        "wellness_score": round(wellness_score, 1),
        "wellness_change": wellness_change,
        "active_employees": len(active_employee_ids),
        "total_employees": total_employees,
        "at_risk_count": at_risk_count,
        "at_risk_percentage": round((at_risk_count / total_employees * 100) if total_employees > 0 else 0, 1),
        "avg_stress": round(avg_stress, 1),
        "stress_change": stress_change,
        "avg_engagement": round(avg_engagement, 1),
        "engagement_change": engagement_change,
        "dominant_emotion": dominant_emotion,
        "checkins_this_week": checkins_this_week,
        "checkins_this_month": checkins_this_month,
        "completion_rate": round(completion_rate, 1),
        "stress_trend": stress_trend,
        "engagement_trend": engagement_trend,
        "emotion_distribution": dict(emotion_counts)
    }

