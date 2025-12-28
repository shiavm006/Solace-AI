from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic_settings import BaseSettings
from dotenv import load_dotenv
import os

load_dotenv()

class Settings(BaseSettings):
    twilio_account_sid: str = ""
    twilio_auth_token: str = ""
    twilio_phone_number: str = ""
    postgres_url: str = ""
    chromadb_path: str = "./chroma_db"
    mlflow_tracking_uri: str = "./mlruns"
    wandb_api_key: str = ""
    wandb_project: str = "sara-ai"
    
    class Config:
        env_file = ".env"
        case_sensitive = False

settings = Settings()

app = FastAPI(
    title="Sara AI Backend",
    description="ML-heavy voice companion API with emotion detection and empathetic responses",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "service": "Sara AI Backend"
    }

@app.post("/voice-webhook")
async def voice_webhook():
    return {
        "message": "Voice webhook endpoint - Twilio integration coming soon"
    }

