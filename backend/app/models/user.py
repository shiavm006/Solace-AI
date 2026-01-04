from datetime import datetime
from typing import Optional, Literal
from pydantic import BaseModel, EmailStr

class UserInDB(BaseModel):
    email: EmailStr
    first_name: str
    last_name: str
    role: Literal["admin", "employee"] = "employee"
    hashed_password: str
    is_active: bool = True
    created_at: datetime = datetime.utcnow()
    updated_at: datetime = datetime.utcnow()
    
    @property
    def name(self) -> str:
        """Computed property for backward compatibility"""
        return f"{self.first_name} {self.last_name}"

