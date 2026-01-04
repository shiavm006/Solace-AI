#!/bin/bash

# solace ai backend startup script

echo "🚀 Starting Solace AI Backend..."
echo ""

# activate virtual environment
if [ -f "venv/bin/activate" ]; then
    source venv/bin/activate
    echo "✅ Virtual environment activated"
else
    echo "❌ Virtual environment not found!"
    echo "Run: python -m venv venv && source venv/bin/activate && pip install -r requirements.txt"
    exit 1
fi

# check if mongodb is running
if ! pgrep -x "mongod" > /dev/null; then
    echo "⚠️  Warning: MongoDB might not be running"
    echo "Start it with: brew services start mongodb-community"
fi

echo ""
echo "🔥 Starting FastAPI server..."
echo "   - API: http://localhost:8000"
echo "   - Docs: http://localhost:8000/docs"
echo ""

# use correct command (main:app, not app.main:app)
uvicorn main:app --reload --host 0.0.0.0 --port 8000

