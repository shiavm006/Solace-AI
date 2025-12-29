from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr

class UserInDB(BaseModel):
    email: EmailStr
    name: str
    about_me: Optional[str] = None
    hashed_password: str
    is_active: bool = True
    created_at: datetime = datetime.utcnow()
    updated_at: datetime = datetime.utcnow()

