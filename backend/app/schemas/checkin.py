from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from datetime import datetime

class CheckInCreate(BaseModel):
    notes: Optional[str] = None
    today: Optional[str] = None
    blockers: Optional[str] = None
    tomorrow: Optional[str] = None

class CheckInResponse(BaseModel):
    task_id: str
    status: str
    message: str

class TaskStatus(BaseModel):
    task_id: str
    status: str
    progress: Optional[int] = None
    message: Optional[str] = None
    result: Optional[Dict[str, Any]] = None
    created_at: datetime
    updated_at: datetime

class CheckInDetail(BaseModel):
    id: str
    emp_id: str
    emp_email: str
    task_id: str
    video_path: str
    status: str
    date: datetime
    notes: Optional[str] = None
    today: Optional[str] = None
    blockers: Optional[str] = None
    tomorrow: Optional[str] = None
    metrics: Optional[Dict[str, Any]] = None
    insights: Optional[Dict[str, Any]] = None
    pdf_url: Optional[str] = None
    created_at: datetime
    updated_at: datetime

