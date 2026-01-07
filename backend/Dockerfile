# ===========================================
# Solace AI Backend - Railway Deployment
# ===========================================

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

# Environment variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONPATH=/app \
    WHISPER_MODEL_SIZE=base \
    OMP_NUM_THREADS=4 \
    MKL_NUM_THREADS=4

# NO HEALTHCHECK - Railway uses its own health check system
# Railway injects PORT env variable automatically

EXPOSE 8000

# Start server on Railway's PORT (defaults to 8000 if not set)
CMD ["sh", "-c", "exec gunicorn main:app --bind 0.0.0.0:${PORT:-8000} --workers 1 --worker-class uvicorn.workers.UvicornWorker --timeout 300 --keep-alive 5 --access-logfile - --error-logfile -"]
