from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routes import auth, checkin
from app.database import init_database
from app.middleware.logging import RequestLoggingMiddleware
from datetime import datetime
import logging
import os
import asyncio
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
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

# Global flag to track startup status
_startup_complete = False
_model_loading_task = None

@app.on_event("startup")
async def startup_event():
    """Initialize database on startup. ML models load in background (non-blocking)."""
    global _startup_complete, _model_loading_task
    
    # Mark startup as complete immediately so health checks pass
    _startup_complete = True
    logger.info("🚀 FastAPI application starting...")
    
    # Initialize database (non-blocking, won't fail startup if it fails)
    try:
        await asyncio.wait_for(init_database(), timeout=10.0)
        logger.info("✅ Database initialized successfully")
    except asyncio.TimeoutError:
        logger.warning("⚠️ Database initialization timed out, will retry on first request")
    except Exception as e:
        logger.error(f"⚠️ Database initialization failed (will retry on first request): {e}")
        # Don't fail startup - database will connect on first use
    
    # Start model loading in background (completely non-blocking)
    async def load_models_background():
        """Load ML models in background without blocking startup"""
        try:
            from app.services.audio_ml import init_whisper, init_sentiment_models
            logger.info("🔄 Starting ML model loading in background...")
            
            # Load models in executor to not block event loop
            loop = asyncio.get_event_loop()
            
            # Load Whisper model
            try:
                await loop.run_in_executor(None, init_whisper)
                logger.info("✅ Whisper model loaded")
            except Exception as e:
                logger.error(f"⚠️ Whisper model loading failed (will load on first request): {e}")
            
            # Load sentiment models
            try:
                await loop.run_in_executor(None, init_sentiment_models)
                logger.info("✅ Sentiment and emotion models loaded")
            except Exception as e:
                logger.error(f"⚠️ Sentiment models loading failed (will load on first request): {e}")
                
        except Exception as e:
            logger.error(f"⚠️ Error in model loading task: {e}", exc_info=True)
            # Don't fail startup if models fail - they'll load lazily
    
    # Start background task (non-blocking)
    try:
        _model_loading_task = asyncio.create_task(load_models_background())
        logger.info("🚀 Startup complete. API ready. Models loading in background...")
    except Exception as e:
        logger.error(f"⚠️ Failed to start model loading task: {e}")
        # Startup still succeeds

app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(checkin.router, prefix="/api/checkin", tags=["Check-ins"])

@app.get("/")
async def root():
    """Root endpoint - simple API status"""
    return {
        "message": "Solace AI API is running",
        "status": "ok",
        "timestamp": datetime.utcnow().isoformat()
    }

@app.get("/health")
async def health_check():
    """
    Health check endpoint that always returns 200 during startup.
    Railway needs this to pass during deployment.
    Must return quickly (< 5 seconds) to pass health checks.
    """
    # Fast response - don't block on anything
    health_status = {
        "status": "healthy",
        "api": "running",
        "startup_complete": _startup_complete,
        "timestamp": datetime.utcnow().isoformat()
    }
    
    # Quick database check with timeout
    try:
        from app.database import get_database
        db = await asyncio.wait_for(get_database(), timeout=2.0)
        await asyncio.wait_for(db.command("ping"), timeout=2.0)
        health_status["database"] = "connected"
    except asyncio.TimeoutError:
        health_status["database"] = "timeout"
        health_status["status"] = "degraded"
    except Exception as e:
        health_status["database"] = "error"
        health_status["status"] = "degraded"
    
    # Quick model status check (non-blocking)
    try:
        from app.services.audio_ml import WHISPER_MODEL, SENTIMENT_ANALYZER, EMOTION_ANALYZER
        
        if WHISPER_MODEL is not None:
            health_status["whisper_model"] = "loaded"
        elif _model_loading_task and not _model_loading_task.done():
            health_status["whisper_model"] = "loading"
        else:
            health_status["whisper_model"] = "not_loaded"
        
        if SENTIMENT_ANALYZER is not None:
            health_status["sentiment_model"] = "loaded"
        elif _model_loading_task and not _model_loading_task.done():
            health_status["sentiment_model"] = "loading"
        else:
            health_status["sentiment_model"] = "not_loaded"
        
        if EMOTION_ANALYZER is not None:
            health_status["emotion_model"] = "loaded"
        elif _model_loading_task and not _model_loading_task.done():
            health_status["emotion_model"] = "loading"
        else:
            health_status["emotion_model"] = "not_loaded"
    except Exception:
        # Don't fail health check if model check fails
        health_status["models"] = "check_failed"
    
    # Always return 200 - Railway health check needs this
    # The endpoint exists and responds quickly = healthy
    return health_status
