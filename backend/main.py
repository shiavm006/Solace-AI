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




logging.basicConfig(

    level=logging.INFO,

    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'

)

logger = logging.getLogger(__name__)




PORT = os.environ.get("PORT", "8000")

logger.info(f"🌐 PORT environment variable: {PORT}")



limiter = Limiter(key_func=get_remote_address)



app = FastAPI(

    title="Solace AI API",

    description="Backend API for Solace AI Application",

    version="1.0.0"

)



app.state.limiter = limiter

app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)





app.add_middleware(

    CORSMiddleware,

    allow_origins=["*"],

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"],

    expose_headers=["X-Request-ID"],

)




app.add_middleware(RequestLoggingMiddleware)




app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])

app.include_router(checkin.router, prefix="/api/checkin", tags=["Check-ins"])




@app.get("/")

def root():

    """Root endpoint - sync, no async, instant response"""

    return {"status": "ok"}



@app.get("/health")

def health_check():

    """
    Health check for Railway - MUST be sync and instant.
    No async, no database checks, no imports.
    """

    return {"status": "ok"}




_model_loading_task = None



@app.on_event("startup")

async def startup_event():

    """Initialize database and start ML model loading in background."""

    global _model_loading_task

    

    logger.info(f"🚀 FastAPI starting on port {PORT}...")

    logger.info(f"📋 CORS origins: {settings.CORS_ORIGINS}")

    


    try:

        await asyncio.wait_for(init_database(), timeout=10.0)

        logger.info("✅ Database connected")

    except Exception as e:

        logger.warning(f"⚠️ Database init failed (will retry): {e}")

    


    async def load_models():

        try:

            from app.services.audio_ml import init_whisper, init_sentiment_models

            logger.info("🔄 Loading ML models in background...")

            

            loop = asyncio.get_event_loop()

            

            try:

                await loop.run_in_executor(None, init_whisper)

                logger.info("✅ Whisper model loaded")

            except Exception as e:

                logger.error(f"⚠️ Whisper failed: {e}")

            

            try:

                await loop.run_in_executor(None, init_sentiment_models)

                logger.info("✅ Sentiment models loaded")

            except Exception as e:

                logger.error(f"⚠️ Sentiment models failed: {e}")

                

        except Exception as e:

            logger.error(f"⚠️ Model loading error: {e}")

    

    _model_loading_task = asyncio.create_task(load_models())

    logger.info("🚀 Startup complete. Health check ready.")

