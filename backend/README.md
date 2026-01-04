# Solace AI Backend

FastAPI backend for the Solace AI application with MongoDB.

## Setup

1. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Install and start MongoDB:
```bash
# macOS (using Homebrew)
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community

# Ubuntu
sudo apt-get install -y mongodb

# Or use Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

4. Configure environment variables:
```bash
# Create .env file in the backend directory
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=solace_ai
SECRET_KEY=your-secret-key-here-use-openssl-rand-hex-32
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
CORS_ORIGINS=http://localhost:3000
```

5. Run the development server:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## API Documentation

Once running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Authentication Endpoints

### POST /api/auth/register
Register a new user with name, email, password, and about_me.

### POST /api/auth/login
Login with email and password. Returns JWT token.

### GET /api/auth/me
Get current user profile (requires authentication).

### PUT /api/auth/me
Update current user profile (requires authentication).

## Project Structure

```
backend/
├── main.py              # FastAPI application entry point
├── requirements.txt     # Python dependencies
└── app/
    ├── config.py       # Configuration settings
    ├── database.py     # MongoDB connection
    ├── models/         # Data models
    ├── schemas/        # Pydantic schemas
    ├── routes/         # API endpoints
    └── utils/          # Utility functions (auth, etc.)
```

