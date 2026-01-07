#!/bin/bash
# ===========================================
# Solace AI Backend - Startup Script
# ===========================================

set -e  # Exit on error

echo "🚀 Starting Solace AI Backend..."
echo ""

# Determine environment
ENV="${ENVIRONMENT:-development}"

# Activate virtual environment (local development)
if [ "$ENV" = "development" ]; then
    if [ -f "venv/bin/activate" ]; then
        source venv/bin/activate
        echo "✅ Virtual environment activated"
    else
        echo "❌ Virtual environment not found!"
        echo "Run: python -m venv venv && source venv/bin/activate && pip install -r requirements.txt"
        exit 1
    fi
    
    # Check if MongoDB is running (local only)
    if ! pgrep -x "mongod" > /dev/null 2>&1; then
        echo "⚠️  Warning: MongoDB might not be running"
        echo "Start it with: brew services start mongodb-community"
    fi
fi

# Create required directories
mkdir -p /tmp/solace_videos /tmp/solace_pdfs

echo ""
echo "🔥 Starting FastAPI server..."
echo "   - Environment: $ENV"
echo "   - API: http://localhost:8000"
echo "   - Docs: http://localhost:8000/docs"
echo "   - Health: http://localhost:8000/health"
echo ""

if [ "$ENV" = "production" ]; then
    # Production: Use gunicorn with uvicorn workers
    WORKERS="${WORKERS:-2}"
    echo "   - Workers: $WORKERS"
    exec gunicorn main:app \
        --bind 0.0.0.0:8000 \
        --workers "$WORKERS" \
        --worker-class uvicorn.workers.UvicornWorker \
        --timeout 120 \
        --keep-alive 5 \
        --access-logfile - \
        --error-logfile -
else
    # Development: Use uvicorn with hot reload
    exec uvicorn main:app --reload --host 0.0.0.0 --port 8000
fi
