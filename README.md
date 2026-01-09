# Solace AI

An employee wellness platform that analyzes daily video check-ins to track mental health and wellbeing.

## What It Does

Employees record short video check-ins (30-120 seconds) answering questions about their day. The platform analyzes:

- **Video**: Facial expressions, stress indicators, engagement levels
- **Audio**: Speech transcription, sentiment analysis, voice patterns
- **Insights**: AI-generated wellness recommendations and trends

Managers and HR get real-time visibility into team wellness without invasive monitoring. Videos are deleted immediately after processing - only metrics are stored.

## How It Works

1. Employee records a video check-in through the web app
2. Video is uploaded and processed in the background
3. ML models analyze facial expressions, speech patterns, and sentiment
4. AI generates personalized insights and recommendations
5. Results appear in dashboards for employees and managers

## Tech Stack

- **Frontend**: Next.js, TypeScript, TailwindCSS
- **Backend**: FastAPI, Python, MongoDB
- **ML**: MediaPipe (face detection), OpenAI Whisper (transcription), Groq (insights)
- **Deployment**: Docker, Railway

## Backend

**API URL**: https://solace-ai-production.up.railway.app/

The backend handles video uploads, ML processing, authentication, and data storage. It uses FastAPI for async processing and MongoDB for flexible data storage.

## Setup

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

Create `.env` file:
```
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret_key
GROQ_API_KEY=your_groq_key
OPENAI_API_KEY=your_openai_key
CORS_ORIGINS=["http://localhost:3000"]
```

Run:
```bash
./start.sh
```

### Frontend

```bash
cd frontend
npm install
```

Create `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Run:
```bash
npm run dev
```

## Docker

```bash
docker-compose up
```

This starts both frontend and backend services.

## Features

- Daily video check-ins with real-time processing
- Sentiment and emotion analysis from speech
- Stress and engagement scoring from facial expressions
- AI-generated wellness insights
- PDF reports for check-ins
- Role-based dashboards (employee, manager, admin)
- Privacy-first: videos deleted after processing
