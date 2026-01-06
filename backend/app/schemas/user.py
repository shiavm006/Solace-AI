from pydantic import BaseModel, EmailStr, Field, computed_field
from datetime import datetime
from typing import Optional, Literal

class UserBase(BaseModel):
    email: EmailStr
    first_name: str = Field(..., min_length=1, max_length=50)
    last_name: str = Field(..., min_length=1, max_length=50)
    role: Literal["admin", "employee"] = Field(..., description="User role: admin or employee")
    
    @computed_field
    @property
    def name(self) -> str:
        return f"{self.first_name} {self.last_name}"

class UserCreate(UserBase):
    password: str = Field(..., min_length=8)

class UserLogin(BaseModel):
    email: EmailStr
    password: str
    remember_me: bool = False

class UserResponse(UserBase):
    id: str
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class TokenData(BaseModel):
    email: Optional[str] = None

