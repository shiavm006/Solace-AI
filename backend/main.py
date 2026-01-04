from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routes import auth, calls

app = FastAPI(
    title="Solace AI API",
    description="Backend API for Solace AI Application",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(calls.router, prefix="/api/calls", tags=["Calls"])

@app.get("/")
async def root():
    return {"message": "Solace AI API is running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

