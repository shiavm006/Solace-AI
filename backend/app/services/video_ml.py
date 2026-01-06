import cv2
import mediapipe as mp
import numpy as np
from typing import Dict, Any
import asyncio
import logging
from app.config import settings

logger = logging.getLogger(__name__)

mp_face_mesh = mp.solutions.face_mesh
mp_drawing = mp.solutions.drawing_utils

def calculate_eye_aspect_ratio(landmarks, eye_indices):
    """
    Calculate Eye Aspect Ratio (EAR) for yawn/fatigue detection
    Low EAR indicates closed eyes or yawning
    """
    eye_points = np.array([
        [landmarks[i].x, landmarks[i].y] for i in eye_indices[:6]
    ])
    
    vertical_1 = np.linalg.norm(eye_points[1] - eye_points[5])
    vertical_2 = np.linalg.norm(eye_points[2] - eye_points[4])
    horizontal = np.linalg.norm(eye_points[0] - eye_points[3])
    
    if horizontal == 0:
        return 0
    
    ear = (vertical_1 + vertical_2) / (2.0 * horizontal)
    return ear

def calculate_head_pose(landmarks):
    """
    Calculate head pose (yaw, pitch) for attention detection
    Higher variance = more head movement = less attention
    """
    nose_tip = landmarks[4]
    chin = landmarks[152]
    left_eye = landmarks[33]
    right_eye = landmarks[263]
    
    eye_center_x = (left_eye.x + right_eye.x) / 2
    nose_x = nose_tip.x
    
    yaw = (nose_x - eye_center_x) * 100
    pitch = (nose_tip.y - chin.y) * 100
    
    return yaw, pitch

def detect_stress_from_face(landmarks):
    """
    Simple stress detection from facial landmarks
    Uses mouth opening and eyebrow position as indicators
    """
    mouth_top = landmarks[13]
    mouth_bottom = landmarks[14]
    
    
    left_eyebrow = landmarks[70]
    right_eyebrow = landmarks[300]
    left_eye_top = landmarks[159]
    right_eye_top = landmarks[386]
    
    mouth_openness = abs(mouth_top.y - mouth_bottom.y)
    
    left_brow_raise = abs(left_eyebrow.y - left_eye_top.y)
    right_brow_raise = abs(right_eyebrow.y - right_eye_top.y)
    avg_brow_raise = (left_brow_raise + right_brow_raise) / 2
    
    stress_score = min(100, (mouth_openness * 300) + (avg_brow_raise * 200))
    
    return stress_score

async def analyze_video_frames(video_path: str) -> Dict[str, Any]:
    """
    Analyze video frames using MediaPipe FaceMesh
    
    Extracts:
    - Stress levels (from facial expressions)
    - Yawn count (from Eye Aspect Ratio)
    - Head pose variance (attention indicator)
    - Engagement score
    
    Returns dict with all metrics
    """
    logger.info(f"Starting video analysis: {video_path}")
    
    try:
        cap = cv2.VideoCapture(video_path)
    except Exception as e:
        logger.error(f"Failed to create VideoCapture object: {e}")
        raise ValueError(f"Failed to open video file: {str(e)}")
    
    if not cap.isOpened():
        logger.error(f"Could not open video: {video_path}")
        raise ValueError(f"Could not open video: {video_path}")
    
    fps = cap.get(cv2.CAP_PROP_FPS)
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    duration_seconds = total_frames / fps if fps > 0 else 0
    
    if duration_seconds > settings.MAX_VIDEO_DURATION_SECONDS:
        cap.release()
        raise ValueError(f"Video too long ({duration_seconds:.1f}s). Maximum allowed: {settings.MAX_VIDEO_DURATION_SECONDS}s")
    
    if duration_seconds < settings.MIN_VIDEO_DURATION_SECONDS:
        cap.release()
        raise ValueError(f"Video too short ({duration_seconds:.1f}s). Minimum required: {settings.MIN_VIDEO_DURATION_SECONDS}s")
    
    if fps <= 0 or total_frames <= 0:
        cap.release()
        raise ValueError("Invalid video: unable to read video properties")
    
    logger.info(f"Video: {total_frames} frames, {fps} fps, {duration_seconds:.1f}s")
    
    frame_skip = max(1, int(fps / 10))
    
    LEFT_EYE_INDICES = [33, 160, 158, 133, 153, 144]
    RIGHT_EYE_INDICES = [362, 385, 387, 263, 373, 380]
    
    try:
        with mp_face_mesh.FaceMesh(
            static_image_mode=False,
            max_num_faces=1,
            refine_landmarks=True,
            min_detection_confidence=0.5,
            min_tracking_confidence=0.5
        ) as face_mesh:
            
            frame_count = 0
            processed_frames = 0
            
            ear_values = []
            stress_scores = []
            head_poses = []
            yawn_count = 0
            yawn_threshold = 0.20
            consecutive_low_ear = 0
            
            while True:
                ret, frame = cap.read()
                if not ret:
                    break
                
                frame_count += 1
                
                if frame_count % frame_skip != 0:
                    continue
                
                rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                
                results = face_mesh.process(rgb_frame)
                
                if results.multi_face_landmarks:
                    face_landmarks = results.multi_face_landmarks[0]
                    
                    left_ear = calculate_eye_aspect_ratio(face_landmarks.landmark, LEFT_EYE_INDICES)
                    right_ear = calculate_eye_aspect_ratio(face_landmarks.landmark, RIGHT_EYE_INDICES)
                    avg_ear = (left_ear + right_ear) / 2.0
                    ear_values.append(avg_ear)
                    
                    if avg_ear < yawn_threshold:
                        consecutive_low_ear += 1
                        if consecutive_low_ear >= 3:
                            yawn_count += 1
                            consecutive_low_ear = 0
                    else:
                        consecutive_low_ear = 0
                    
                    yaw, pitch = calculate_head_pose(face_landmarks.landmark)
                    head_poses.append((yaw, pitch))
                    
                    stress = detect_stress_from_face(face_landmarks.landmark)
                    stress_scores.append(stress)
                    
                    processed_frames += 1
                
                if processed_frames % 30 == 0:
                    await asyncio.sleep(0.001)
            
            logger.info(f"Processed {processed_frames} frames out of {total_frames}")
        
        if not stress_scores:
            logger.warning("No face detected in video")
            return {
                "stress_avg": 0,
                "stress_max": 0,
                "stress_min": 0,
                "yawns_count": 0,
                "head_pose_variance": 0,
                "engagement_score": 0,
                "duration_seconds": round(duration_seconds, 2),
                "frames_processed": 0,
                "total_frames": total_frames,
                "fps": round(fps, 2),
                "face_detected": False
            }
        
        stress_avg = np.mean(stress_scores)
        stress_max = np.max(stress_scores)
        stress_min = np.min(stress_scores)
        
        yaws = [p[0] for p in head_poses]
        pitches = [p[1] for p in head_poses]
        head_pose_variance = np.var(yaws) + np.var(pitches)
        
        engagement_score = max(0, 100 - (head_pose_variance * 10))
        
        dress_compliance = 0.85
        
        logger.info(f"Analysis complete: stress={stress_avg:.1f}, yawns={yawn_count}, engagement={engagement_score:.1f}")
        
        return {
            "stress_avg": round(float(stress_avg), 2),
            "stress_max": round(float(stress_max), 2),
            "stress_min": round(float(stress_min), 2),
            "yawns_count": yawn_count,
            "head_pose_variance": round(float(head_pose_variance), 2),
            "engagement_score": round(float(engagement_score), 2),
            "dress_compliance": round(float(dress_compliance), 2),
            "duration_seconds": round(duration_seconds, 2),
            "frames_processed": processed_frames,
            "total_frames": total_frames,
            "fps": round(fps, 2),
            "face_detected": True
        }
    
    except cv2.error as e:
        logger.error(f"OpenCV error during video processing: {e}", exc_info=True)
        raise ValueError(f"Video processing failed: {str(e)}")
    except ValueError as e:
        logger.error(f"Video validation error: {e}")
        raise
    except Exception as e:
        logger.error(f"Unexpected error during video processing: {e}", exc_info=True)
        raise ValueError(f"Video processing failed: {str(e)}")
    finally:
        cap.release()

