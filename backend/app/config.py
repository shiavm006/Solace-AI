from pydantic_settings import BaseSettings
from typing import List, Union
from pydantic import Field, field_validator
import json
import os

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
    
    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def parse_cors_origins(cls, v):
        """Parse CORS_ORIGINS from JSON string, comma-separated string, or list"""
        if isinstance(v, str):
            v = v.strip()
            # Try to parse as JSON array first
            if v.startswith('['):
                try:
                    parsed = json.loads(v)
                    if isinstance(parsed, list):
                        # Remove trailing slashes from URLs
                        return [url.rstrip('/') for url in parsed if url]
                except json.JSONDecodeError:
                    pass
            
            # Fallback: treat as comma-separated string
            origins = [origin.strip().rstrip('/') for origin in v.split(',') if origin.strip()]
            return origins
        
        if isinstance(v, list):
            # Remove trailing slashes from URLs
            return [url.rstrip('/') if isinstance(url, str) else url for url in v if url]
        
        return v
    
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
