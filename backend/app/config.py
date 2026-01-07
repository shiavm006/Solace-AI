from pydantic_settings import BaseSettings
from typing import List
from pydantic import Field
from pathlib import Path

class Settings(BaseSettings):
    MONGODB_URL: str = Field(default="mongodb://localhost:27017", validation_alias="MONGO_URI")
    DATABASE_NAME: str = "solace_ai"
    
    SECRET_KEY: str = Field(default="your-secret-key-change-in-production", validation_alias="JWT_SECRET")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REMEMBER_ME_TOKEN_EXPIRE_DAYS: int = 30
    
    CORS_ORIGINS: List[str] = Field(
        default=["http://localhost:3000"],
        validation_alias="CORS_ORIGINS"
    )
    
    GROQ_API_KEY: str = Field(default="")
    
    VIDEOS_DIR: str = Field(default="/tmp/solace_videos")
    MAX_FILE_SIZE_MB: int = Field(default=100)
    MAX_VIDEO_DURATION_SECONDS: int = Field(default=120)
    MIN_VIDEO_DURATION_SECONDS: int = Field(default=3)
    
    PDFS_DIR: str = Field(default="/tmp/solace_pdfs")

    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "ignore"

settings = Settings()

