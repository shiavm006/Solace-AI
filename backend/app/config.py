from pydantic_settings import BaseSettings
from typing import List
from pydantic import Field

class Settings(BaseSettings):
    MONGODB_URL: str = Field(default="mongodb://localhost:27017", validation_alias="MONGO_URI")
    DATABASE_NAME: str = "solace_ai"
    REDIS_URL: str = "redis://localhost:6379"
    SECRET_KEY: str = Field(default="your-secret-key-change-in-production-use-openssl-rand-hex-32", validation_alias="JWT_SECRET")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REMEMBER_ME_TOKEN_EXPIRE_DAYS: int = 30
    CORS_ORIGINS: List[str] = ["http://localhost:3000"]
    
    CHROMA_PATH: str = "./backend/chroma_db"
    DEBUG: bool = False

    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "ignore"

settings = Settings()

