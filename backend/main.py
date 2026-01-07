from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routes import auth, checkin
from app.database import init_database
from app.middleware.logging import RequestLoggingMiddleware
from datetime import datetime
import logging
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

logger = logging.getLogger(__name__)

limiter = Limiter(key_func=get_remote_address)

app = FastAPI(
    title="Solace AI API",
    description="Backend API for Solace AI Application",
    version="1.0.0"
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(RequestLoggingMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-Request-ID"],
)

@app.on_event("startup")
async def startup_event():
    """Initialize database connection and ML models on startup"""
    await init_database()
    
    # Initialize ML models in background (they're slow to load)
    from app.services.audio_ml import init_whisper, init_sentiment_models
    import asyncio
    loop = asyncio.get_event_loop()
    
    # Load Whisper model
    loop.run_in_executor(None, init_whisper)
    logger.info("Whisper model initialization started in background")
    
    # Load sentiment and emotion models
    loop.run_in_executor(None, init_sentiment_models)
    logger.info("Sentiment and emotion models initialization started in background")

app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(checkin.router, prefix="/api/checkin", tags=["Check-ins"])

@app.get("/")
async def root():
    return {"message": "Solace AI API is running"}

@app.get("/health")
async def health_check():
    """
    Health check endpoint that verifies:
    - API is running
    - Database connection is alive
    - Whisper model is loaded
    """
    from app.database import get_database
    from app.services.audio_ml import WHISPER_MODEL
    
    health_status = {
        "status": "healthy",
        "api": "running",
        "database": "unknown",
        "whisper_model": "unknown",
        "timestamp": datetime.utcnow().isoformat()
    }
    
    try:
        db = await get_database()
        await db.command("ping")
        health_status["database"] = "connected"
    except Exception as e:
        health_status["database"] = f"error: {str(e)}"
        health_status["status"] = "degraded"
    
    if WHISPER_MODEL is not None:
        health_status["whisper_model"] = "loaded"
    else:
        health_status["whisper_model"] = "not loaded"
        health_status["status"] = "degraded"
    
    # Check sentiment and emotion models
    from app.services.audio_ml import SENTIMENT_ANALYZER, EMOTION_ANALYZER
    
    if SENTIMENT_ANALYZER is not None:
        health_status["sentiment_model"] = "loaded"
    else:
        health_status["sentiment_model"] = "not loaded"
        health_status["status"] = "degraded"
    
    if EMOTION_ANALYZER is not None:
        health_status["emotion_model"] = "loaded"
    else:
        health_status["emotion_model"] = "not loaded"
        health_status["status"] = "degraded"
    
    return health_status

