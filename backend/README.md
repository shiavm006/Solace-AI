# Video AI Employee Monitoring Backend

FastAPI backend with ML-powered video & audio analysis.

## Quick Start

```bash
# 1. Setup
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# 2. Configure .env
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/
JWT_SECRET=your-secret-key
GROQ_API_KEY=your-groq-api-key

# 3. Run
./start.sh
```

## API

- Swagger: http://localhost:8000/docs
- Auth: `/api/auth/login`, `/api/auth/register`
- Check-ins: `/api/checkin/upload`, `/api/checkin/my-checkins`

## Structure

```
backend/
├── main.py           # FastAPI app
├── app/
│   ├── routes/       # API endpoints
│   ├── services/     # ML & PDF services
│   ├── models/       # DB models
│   └── utils/        # Auth helpers
```

