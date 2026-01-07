# Solace AI Backend

FastAPI backend with ML-powered video & audio analysis for employee wellness check-ins.

## Features

- 🎥 **Video Analysis**: Stress detection, engagement scoring via MediaPipe
- 🎤 **Audio Analysis**: Speech-to-text (Whisper), sentiment & emotion detection
- 📊 **AI Insights**: LLM-powered qualitative assessments via Groq
- 📄 **PDF Reports**: Automated wellness report generation
- 🔐 **JWT Authentication**: Secure user auth with bcrypt

## Quick Start (Development)

```bash
# 1. Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Configure environment
cp .env.example .env
# Edit .env with your values:
# - MONGO_URI
# - JWT_SECRET
# - GROQ_API_KEY

# 4. Start MongoDB
brew services start mongodb-community  # macOS
# or: docker run -d -p 27017:27017 mongo:7

# 5. Run server
./start.sh
# or: uvicorn main:app --reload
```

## Production Deployment

### Docker (Recommended)

```bash
# Build image
docker build -t solace-backend .

# Run container
docker run -d \
  -p 8000:8000 \
  -e MONGO_URI="mongodb://host:27017" \
  -e JWT_SECRET="your-secure-secret" \
  -e GROQ_API_KEY="your-groq-key" \
  -e CORS_ORIGINS='["https://your-frontend.com"]' \
  -v /data/videos:/tmp/solace_videos \
  -v /data/pdfs:/tmp/solace_pdfs \
  solace-backend
```

### Docker Compose

```bash
docker-compose up -d
```

### Manual Production

```bash
# Set environment
export ENVIRONMENT=production
export WORKERS=4

# Run with gunicorn
./start.sh
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `MONGO_URI` | MongoDB connection string | `mongodb://localhost:27017` |
| `JWT_SECRET` | Secret key for JWT tokens | (required) |
| `GROQ_API_KEY` | Groq API key for LLM insights | (optional) |
| `CORS_ORIGINS` | Allowed CORS origins (JSON array) | `["http://localhost:3000"]` |
| `MAX_FILE_SIZE_MB` | Max upload size | `100` |
| `MAX_VIDEO_DURATION_SECONDS` | Max video length | `120` |

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/api/auth/register` | POST | User registration |
| `/api/auth/login` | POST | User login |
| `/api/auth/me` | GET | Get current user |
| `/api/checkin/upload` | POST | Upload video check-in |
| `/api/checkin/my-checkins` | GET | Get user's check-ins |
| `/api/checkin/{id}/pdf` | GET | Download PDF report |

**Swagger Docs**: http://localhost:8000/docs

## Project Structure

```
backend/
├── main.py              # FastAPI app entry point
├── requirements.txt     # Python dependencies
├── Dockerfile           # Production container
├── start.sh             # Startup script
└── app/
    ├── config.py        # Settings & environment
    ├── database.py      # MongoDB connection
    ├── routes/          # API endpoints
    │   ├── auth.py      # Authentication
    │   └── checkin.py   # Check-in management
    ├── services/        # Business logic
    │   ├── audio_ml.py  # Whisper + sentiment
    │   ├── video_ml.py  # MediaPipe analysis
    │   ├── llm_insights.py  # Groq LLM
    │   └── pdf_generator.py # ReportLab
    ├── schemas/         # Pydantic models
    └── utils/           # Helpers
```

## ML Models

- **Whisper (base)**: Speech-to-text transcription
- **DistilBERT**: Sentiment analysis
- **DistilRoBERTa**: Emotion detection (7 emotions)
- **MediaPipe FaceMesh**: Facial landmark detection

Models are loaded on startup in background threads. First request may be slower.

## License

MIT
