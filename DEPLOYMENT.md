# Deployment Guide

## Quick Start (Local Docker)

### Prerequisites
- Docker and Docker Compose installed
- `.env` file in `backend/` directory
- `.env.local` file in `frontend/` directory

### Steps

1. **Create environment files** (if not already done):

   **Backend `.env`:**
   ```bash
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/solace_ai
   JWT_SECRET=your-super-secret-jwt-key-min-32-characters
   GROQ_API_KEY=your-groq-api-key
   CORS_ORIGINS=["http://localhost:3000"]
   ```

   **Frontend `.env.local`:**
   ```bash
   NEXT_PUBLIC_API_URL=http://localhost:8000
   NEXT_PUBLIC_ENV=production
   ```

2. **Build and start containers:**
   ```bash
   docker-compose up --build
   ```

3. **Access your application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Docs: http://localhost:8000/docs

### Useful Commands

```bash
# Start in background
docker-compose up -d

# View logs
docker-compose logs -f

# Stop containers
docker-compose down

# Rebuild everything
docker-compose up --build --force-recreate

# Clean everything
docker-compose down -v
docker system prune -a
```

## Production Deployment

### Option 1: Railway

1. Install Railway CLI:
   ```bash
   npm i -g @railway/cli
   railway login
   ```

2. Deploy backend:
   ```bash
   cd backend
   railway init
   railway up
   ```
   Set environment variables in Railway dashboard.

3. Deploy frontend:
   ```bash
   cd frontend
   railway init
   railway up
   ```
   Set `NEXT_PUBLIC_API_URL` to your Railway backend URL.

### Option 2: Render

**Backend:**
- Create Web Service
- Build: `cd backend && pip install -r requirements.txt`
- Start: `cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT`
- Add environment variables

**Frontend:**
- Create Static Site
- Build: `cd frontend && npm install && npm run build`
- Publish: `frontend/.next`
- Add environment variables

### Option 3: VPS (AWS EC2, DigitalOcean)

1. SSH into server
2. Install Docker:
   ```bash
   curl -fsSL https://get.docker.com -o get-docker.sh
   sh get-docker.sh
   ```
3. Clone repo and deploy:
   ```bash
   git clone your-repo
   cd Sara_AI
   docker-compose up -d --build
   ```

## Environment Variables

### Backend Required:
- `MONGO_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens (32+ chars)
- `GROQ_API_KEY` - Groq API key for LLM insights

### Backend Optional:
- `CORS_ORIGINS` - Allowed origins (JSON array)
- `VIDEOS_DIR` - Video storage path (default: /tmp/solace_videos)
- `PDFS_DIR` - PDF storage path (default: /tmp/solace_pdfs)

### Frontend Required:
- `NEXT_PUBLIC_API_URL` - Backend API URL
- `NEXT_PUBLIC_ENV` - Environment (production/development)

## Troubleshooting

### Port Already in Use
```bash
docker-compose down
# Or change ports in docker-compose.yml
```

### Build Fails
```bash
docker-compose down
docker system prune -a
docker-compose up --build
```

### Frontend Can't Connect to Backend
- Check `NEXT_PUBLIC_API_URL` in frontend `.env.local`
- Verify backend is running: `curl http://localhost:8000/health`

### CORS Errors
- Update `CORS_ORIGINS` in backend `.env`
- Include exact frontend URL (with protocol and port)

### ML Models Not Loading
- First startup takes 2-3 minutes
- Check logs: `docker-compose logs backend`
- Ensure sufficient memory (4GB+ recommended)


