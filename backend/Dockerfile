# ===========================================
# Solace AI Backend - Production Dockerfile
# ===========================================
# Optimized for low-memory environments (Railway, etc.)

# ---- Build Stage ----
FROM python:3.11-slim as builder

WORKDIR /app

# Install build dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .

# Create virtual environment and install dependencies
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Install Python dependencies
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# ---- Production Stage ----
FROM python:3.11-slim as production

WORKDIR /app

# Install runtime dependencies only
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    libsndfile1 \
    libgl1 \
    libglib2.0-0 \
    curl \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

# Copy virtual environment from builder
COPY --from=builder /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Copy application code
COPY . .

# Create non-root user for security
RUN useradd --create-home --shell /bin/bash appuser && \
    mkdir -p /tmp/solace_videos /tmp/solace_pdfs /home/appuser/.cache && \
    chown -R appuser:appuser /app /tmp/solace_videos /tmp/solace_pdfs /home/appuser/.cache

USER appuser

# Environment variables for low-memory deployment
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONPATH=/app \
    # Use tiny Whisper model (39MB vs 139MB for base)
    WHISPER_MODEL_SIZE=tiny \
    # Limit PyTorch threads to reduce memory
    OMP_NUM_THREADS=1 \
    MKL_NUM_THREADS=1

# Health check with longer start period for model loading
HEALTHCHECK --interval=30s --timeout=15s --start-period=120s --retries=5 \
    CMD curl -f http://localhost:8000/health || exit 1

EXPOSE 8000

# Use single worker for low-memory environments
# Models are loaded lazily on first request
CMD ["gunicorn", "main:app", \
    "--bind", "0.0.0.0:8000", \
    "--workers", "1", \
    "--worker-class", "uvicorn.workers.UvicornWorker", \
    "--timeout", "300", \
    "--keep-alive", "5", \
    "--access-logfile", "-", \
    "--error-logfile", "-"]
