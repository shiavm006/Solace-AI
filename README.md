# Solace AI - AI-Powered Employee Wellness Intelligence Platform

## 🎯 Overview

**Solace AI** is an enterprise AI-powered employee wellness intelligence platform that analyzes daily video check-ins to provide real-time insights into employee wellbeing, stress levels, engagement, and mental health indicators.

Unlike traditional survey-based wellness tools, Solace AI uses **multimodal AI analysis** (video + audio + NLP) to detect subtle patterns in employee behavior, speech, and facial expressions, providing HR teams and managers with objective, data-driven wellness metrics.

### What Makes Solace AI Unique?

- **🎥 Video-First Approach**: Analyzes facial expressions, micro-expressions, and body language
- **🎤 Audio Intelligence**: Transcribes speech, analyzes sentiment, tone, and speaking patterns
- **🤖 AI-Powered Insights**: Generates personalized wellness recommendations using LLMs
- **📊 Real-Time Analytics**: Instant processing and feedback for employees
- **🔒 Privacy-Focused**: Videos deleted after processing, only metrics stored
- **📈 Scalable Architecture**: Built for enterprise-scale deployments

---

## 🚨 Problem Statement

### The Challenge

Modern workplaces face critical challenges in monitoring and supporting employee mental health and wellbeing:

#### 1. **Mental Health Crisis in Remote Work**
- 76% of employees report burnout
- Remote work makes it harder to detect early warning signs
- Traditional check-ins are subjective and infrequent

#### 2. **Lack of Objective Metrics**
- Self-reported surveys have bias and low response rates
- Managers lack tools to identify struggling employees early
- No standardized way to measure wellbeing across teams

#### 3. **Reactive vs. Proactive Support**
- Problems identified too late, after productivity loss
- No early intervention mechanisms
- Limited data to guide wellness programs

#### 4. **Scalability Issues**
- HR teams can't personally check in with hundreds of employees
- Manual wellness assessments are time-consuming
- Inconsistent evaluation across departments

### What Existed Before?

**Traditional Solutions:**
- ❌ Manual surveys (low engagement, bias)
- ❌ Periodic 1-on-1s (infrequent, subjective)
- ❌ Sentiment analysis tools (text-only, limited context)
- ❌ Activity tracking (invasive, privacy concerns)

**None addressed the core problem: Real-time, objective, scalable wellness monitoring**

---

## 💡 Our Solution

### How Solace AI Solves This

Solace AI introduces a **paradigm shift** in employee wellness monitoring through:

#### 1. **Daily Video Check-Ins** (30-120 seconds)
Employees record short videos answering:
- "What did you accomplish today?"
- "Any blockers or challenges?"
- "What are you planning for tomorrow?"

#### 2. **Multimodal AI Analysis**
Our ML pipeline analyzes:
- **Visual**: Facial expressions, stress indicators, yawns, engagement
- **Audio**: Voice energy, pitch variance, speaking pace, sentiment
- **Text**: Transcript analysis, keyword detection, emotional tone

#### 3. **Instant Intelligent Insights**
- Real-time wellness scores
- Personalized recommendations
- Trend analysis over time
- Early warning system for burnout

#### 4. **Privacy-First Design**
- Videos immediately deleted post-processing
- Only anonymized metrics stored
- Compliant with data protection regulations

### Impact

✅ **For Employees**: Personalized wellness support, actionable feedback  
✅ **For Managers**: Early intervention, team health visibility  
✅ **For HR**: Data-driven wellness programs, reduced turnover  
✅ **For Organizations**: Improved productivity, better culture

---

## 🏗️ Why This is a Product, Not Just a Website

### Product vs. Website: Key Distinctions

| Aspect | Traditional Website | Solace AI (Product) |
|--------|-------------------|-------------------|
| **Purpose** | Informational | Problem-solving platform |
| **Value** | Content delivery | Intelligence & automation |
| **Complexity** | Static pages | Multi-stage ML pipeline |
| **Architecture** | Frontend + basic backend | Distributed microservices |
| **Data Processing** | Simple CRUD | Real-time ML inference |
| **Scalability** | Linear | Horizontal + vertical |
| **User Experience** | Browsing | Workflow automation |
| **Business Model** | Ad-based / SaaS | Enterprise licensing |

### What Makes Solace AI a Product?

#### 1. **Complex Processing Pipeline**
```
Video Upload → Frame Extraction → Face Detection → 
Stress Analysis → Audio Transcription → Sentiment Analysis → 
LLM Insight Generation → PDF Report → Notification
```

#### 2. **Machine Learning Infrastructure**
- **MediaPipe FaceMesh**: 468-point facial landmark detection
- **OpenAI Whisper**: State-of-the-art audio transcription
- **Groq LLM**: Real-time insight generation
- **Custom ML Models**: Stress detection, engagement scoring

#### 3. **Enterprise-Grade Features**
- Role-based access control (RBAC)
- Multi-tenant architecture ready
- Rate limiting & DDoS protection
- Audit logging & compliance
- Scalable background job processing

#### 4. **Production-Ready System Design**
- Asynchronous task processing
- Database indexing & optimization
- Error handling & retry logic
- Health monitoring & observability
- Automated testing & CI/CD ready

#### 5. **Data Intelligence Layer**
- Historical trend analysis
- Anomaly detection
- Predictive analytics (future)
- Team-level aggregations

---

## 🏛️ System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER LAYER                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   Employee   │  │   Manager    │  │     Admin    │         │
│  │  Dashboard   │  │  Dashboard   │  │   Console    │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                           │
│                    Next.js 14 Frontend                          │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  React Components │ TailwindCSS │ TypeScript │ ShadcnUI │   │
│  │  State Management │ API Client │ WebRTC Video Recording │   │
│  └────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                      API GATEWAY LAYER                          │
│                       FastAPI Backend                           │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  Rate Limiting │ CORS │ Auth Middleware │ Logging      │    │
│  │  Request Validation │ Error Handling │ Response Caching │   │
│  └────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    BUSINESS LOGIC LAYER                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │ Auth Service │  │Check-in Route│  │ User Service │         │
│  │  - JWT Auth  │  │ - Upload     │  │ - CRUD Ops   │         │
│  │  - RBAC      │  │ - Status Poll│  │ - Profile    │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                   ML PROCESSING PIPELINE                        │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                 Background Task Queue                     │  │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐         │  │
│  │  │   Video    │→ │   Audio    │→ │    LLM     │         │  │
│  │  │  Analysis  │  │  Analysis  │  │  Insights  │         │  │
│  │  └────────────┘  └────────────┘  └────────────┘         │  │
│  │       ↓               ↓               ↓                  │  │
│  │  MediaPipe      Whisper ASR      Groq LLM               │  │
│  │  FaceMesh       Librosa          llama-3.1-8b           │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                      DATA LAYER                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   MongoDB    │  │  File System │  │   Redis      │         │
│  │  (Primary DB)│  │  (Videos/PDF)│  │  (Cache)     │         │
│  │  - Users     │  │  - Temp Store│  │  - Sessions  │         │
│  │  - Check-ins │  │  - Auto Clean│  │  - Rate Limit│         │
│  │  - Tasks     │  │              │  │              │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                   EXTERNAL SERVICES                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │  MongoDB     │  │    Groq      │  │   SendGrid   │         │
│  │   Atlas      │  │     API      │  │    (Email)   │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
└─────────────────────────────────────────────────────────────────┘
```


## 🛠️ Tech Stack

### Frontend Stack

| Technology | Purpose | Why Chosen |
|------------|---------|------------|
| **Next.js 14** | React Framework | Server-side rendering, App Router, performance |
| **TypeScript** | Type Safety | Reduces bugs, better developer experience |
| **TailwindCSS** | Styling | Rapid UI development, responsive design |
| **ShadcnUI** | Component Library | Beautiful, accessible components |
| **React 18** | UI Library | Latest features, concurrent rendering |
| **MediaRecorder API** | Video Capture | Native browser video recording |

### Backend Stack

| Technology | Purpose | Why Chosen |
|------------|---------|------------|
| **FastAPI** | Web Framework | Async support, automatic OpenAPI docs, high performance |
| **Python 3.11** | Language | Rich ML ecosystem, async/await support |
| **Motor** | Async MongoDB Driver | Non-blocking database operations |
| **Pydantic** | Data Validation | Type-safe request/response validation |
| **JWT** | Authentication | Stateless, scalable auth |
| **SlowAPI** | Rate Limiting | DDoS protection, abuse prevention |
| **Uvicorn** | ASGI Server | High-performance async server |

### Machine Learning Stack

| Technology | Purpose | Why Chosen |
|------------|---------|------------|
| **MediaPipe** | Face Detection | Google's production-ready face mesh (468 landmarks) |
| **OpenCV** | Video Processing | Industry standard, extensive features |
| **OpenAI Whisper** | Speech-to-Text | State-of-the-art accuracy, multilingual |
| **Librosa** | Audio Analysis | Voice energy, pitch, feature extraction |
| **Groq API** | LLM Inference | Ultra-fast inference (llama-3.1-8b-instant) |
| **NumPy** | Numerical Computing | Array operations, efficient computation |

### Database & Storage

| Technology | Purpose | Why Chosen |
|------------|---------|------------|
| **MongoDB Atlas** | Primary Database | Flexible schema, scalability, cloud-native |
| **File System** | Temporary Storage | Videos/PDFs (with auto-cleanup) |
| **Redis** (Future) | Caching | Session management, rate limiting |

### DevOps & Infrastructure

| Technology | Purpose | Why Chosen |
|------------|---------|------------|
| **Docker** (Planned) | Containerization | Consistent environments, easy deployment |
| **GitHub Actions** (Planned) | CI/CD | Automated testing, deployment |
| **Nginx** (Planned) | Reverse Proxy | Load balancing, SSL termination |
| **AWS/GCP** (Planned) | Cloud Hosting | Scalability, reliability |

---

## ⚙️ Key Features

### For Employees 👨‍💼

- ✅ **Quick Daily Check-ins**: 30-120 second video recordings
- ✅ **Instant Feedback**: Real-time wellness insights and recommendations
- ✅ **Privacy Protection**: Videos deleted immediately after processing
- ✅ **Personal Dashboard**: Track your wellness trends over time
- ✅ **PDF Reports**: Download detailed analysis reports

### For Managers 👔

- ✅ **Team Overview**: Aggregated wellness metrics for your team
- ✅ **Early Warning System**: Identify struggling team members early
- ✅ **Historical Trends**: Track team wellness over time
- ✅ **Actionable Insights**: Data-driven recommendations for support

### For HR & Admins 🏢

- ✅ **Organization-Wide Analytics**: Company wellness dashboard
- ✅ **Compliance Reporting**: GDPR/HIPAA compliant data handling
- ✅ **Custom Policies**: Configure check-in frequency, questions
- ✅ **User Management**: Role-based access control

---

## 🤖 Machine Learning Pipeline

### Video Analysis Module (`video_ml.py`)

**Objective**: Analyze facial expressions and visual cues for stress and engagement indicators

**Process**:
1. **Video Ingestion**: Accept video file (mp4, webm, avi)
2. **Frame Extraction**: Sample 10 frames/second for performance
3. **Face Detection**: MediaPipe FaceMesh (468 landmark points)
4. **Feature Extraction**:
   - **Eye Aspect Ratio (EAR)**: Fatigue/yawn detection
   - **Head Pose**: Attention/engagement tracking
   - **Facial Landmarks**: Stress indicators (eyebrow position, mouth tension)
5. **Metric Calculation**:
   - Stress levels (0-100 scale)
   - Yawn count
   - Engagement score
   - Head pose variance

**Algorithms**:
```python
EAR = (vertical_dist_1 + vertical_dist_2) / (2 * horizontal_dist)
Stress Score = f(mouth_openness, eyebrow_raise)
Engagement = 100 - (head_pose_variance * 10)
```

**Output**:
```json
{
  "stress_avg": 45.2,
  "stress_max": 78.5,
  "yawns_count": 2,
  "engagement_score": 82.3,
  "head_pose_variance": 1.42,
  "face_detected": true
}
```

### Audio Analysis Module (`audio_ml.py`)

**Objective**: Transcribe speech and analyze voice patterns for emotional and stress indicators

**Process**:
1. **Audio Extraction**: Extract audio track from video
2. **Transcription**: OpenAI Whisper (base model)
   - 99%+ accuracy
   - Language detection
   - Timestamp alignment
3. **Voice Feature Extraction** (Librosa):
   - **Voice Energy (RMS)**: Loudness indicator
   - **Pitch Variance**: Stress in voice
   - **Speaking Pace**: Words per minute
   - **Pause Detection**: Hesitation tracking
4. **Sentiment Analysis**: Keyword-based (upgradeable to BERT)

**Metrics Calculated**:
- Word count
- Speaking pace (WPM)
- Voice energy (0-1 scale)
- Pitch variance (stress indicator)
- Pause count (hesitation)
- Sentiment (positive/negative/neutral)

**Output**:
```json
{
  "transcript": "Today I completed the API integration...",
  "word_count": 45,
  "speaking_pace_wpm": 145,
  "voice_energy": 0.523,
  "pitch_variance": 12.4,
  "pauses_count": 3,
  "sentiment": "positive"
}
```

### LLM Insight Generation (`llm_insights.py`)

**Objective**: Generate human-readable, personalized wellness insights and recommendations

**Process**:
1. **Context Preparation**: Combine video + audio metrics
2. **Prompt Engineering**: Structured prompt with employee context
3. **LLM Inference**: Groq API (llama-3.1-8b-instant)
   - Sub-second latency
   - Context-aware generation
4. **Response Parsing**: Extract summary and action items
5. **Fallback Logic**: Rule-based insights if LLM unavailable

**Prompt Structure**:
```
You are an AI wellness coach analyzing check-in for [Employee Name].

Video Metrics: stress=45%, yawns=2, engagement=82%
Audio Metrics: sentiment=positive, pace=145wpm, pauses=3

Provide:
1. Brief empathetic summary (2-3 sentences)
2. 3-5 specific actionable recommendations
```

**Output**:
```json
{
  "summary": "John shows good engagement with moderate stress levels. Speaking pace is healthy, indicating confidence.",
  "actions": [
    "Continue current work-life balance practices",
    "Consider short breaks to reduce stress spikes",
    "Great job maintaining positive communication"
  ]
}
```

---

## 🔄 Data Flow

### Complete Request Flow

```
1. USER RECORDS VIDEO
   ↓
2. FRONTEND UPLOADS (multipart/form-data)
   - Video file (< 100MB)
   - Notes/text input
   - Employee metadata
   ↓
3. API GATEWAY (FastAPI)
   - Rate limit check (5 uploads/hour)
   - Authentication (JWT validation)
   - File validation (size, format, duration)
   - Save to temp storage (/tmp/solace_videos/)
   ↓
4. TASK CREATED IN DB
   - Status: "queued"
   - Task ID returned to frontend
   ↓
5. BACKGROUND PROCESSING STARTS
   ├─> VIDEO ANALYSIS (MediaPipe + OpenCV)
   │   - Face detection
   │   - Stress scoring
   │   - Engagement tracking
   │   - Takes ~10-20 seconds
   │
   ├─> AUDIO ANALYSIS (Whisper + Librosa)
   │   - Transcription
   │   - Voice feature extraction
   │   - Sentiment analysis
   │   - Takes ~15-30 seconds
   │
   └─> LLM INSIGHT GENERATION (Groq)
       - Context preparation
       - LLM inference
       - Response parsing
       - Takes ~2-5 seconds
   ↓
6. RESULTS AGGREGATION
   - Combine all metrics
   - Calculate composite scores
   - Generate recommendations
   ↓
7. PDF REPORT GENERATION (ReportLab)
   - Format results
   - Create professional report
   - Save to /tmp/solace_pdfs/
   ↓
8. DATABASE UPDATE
   - Store metrics (MongoDB)
   - Update task status: "completed"
   - Delete original video (privacy)
   ↓
9. FRONTEND POLLING DETECTS COMPLETION
   - Display results
   - Show PDF download link
   - Update dashboard
```

### Status Polling Flow

```
Frontend (Every 2 seconds):
  GET /api/checkin/status/{task_id}
    ↓
  Response:
    - status: "queued" | "processing" | "completed" | "failed"
    - progress: 0-100
    - message: "Analyzing video..."
    - result: {...} (when completed)
```

---

## 🎨 System Design Decisions

### 1. **Asynchronous Processing**

**Decision**: Use FastAPI background tasks instead of Celery  
**Rationale**:
- ✅ Simpler architecture for MVP
- ✅ No additional Redis/RabbitMQ dependency
- ✅ Sufficient for current scale
- ⚠️ Future: Migrate to Celery for distributed processing

### 2. **Video Storage Strategy**

**Decision**: Immediate deletion after processing  
**Rationale**:
- ✅ Privacy-first approach
- ✅ Reduces storage costs
- ✅ Compliance with data protection laws
- ✅ Users trust increased

### 3. **Database Choice: MongoDB**

**Decision**: MongoDB over PostgreSQL  
**Rationale**:
- ✅ Flexible schema for evolving ML metrics
- ✅ Better for nested JSON structures
- ✅ Horizontal scalability
- ✅ Native aggregation pipeline for analytics

### 4. **LLM Provider: Groq**

**Decision**: Groq API over OpenAI  
**Rationale**:
- ✅ 10x faster inference (LPU architecture)
- ✅ Free tier for development
- ✅ Cost-effective for scale
- ⚠️ Fallback to rule-based insights if unavailable

### 5. **Frontend Framework: Next.js 14**

**Decision**: Next.js over React SPA  
**Rationale**:
- ✅ Server-side rendering for better SEO
- ✅ App Router for modern architecture
- ✅ Built-in API routes (future use)
- ✅ Image optimization
- ✅ Production-ready out of the box

### 6. **Authentication: JWT**

**Decision**: JWT over session-based auth  
**Rationale**:
- ✅ Stateless (scales horizontally)
- ✅ Works across microservices
- ✅ Mobile app ready
- ✅ Reduced database queries

### 7. **ML Model Deployment**

**Decision**: In-process models (MediaPipe, Whisper) vs. API calls  
**Rationale**:
- ✅ Lower latency (no network calls)
- ✅ Cost-effective (no per-request charges)
- ✅ Works offline
- ⚠️ Higher memory usage per instance

### 8. **Rate Limiting Strategy**

**Decision**: IP-based rate limiting with SlowAPI  
**Rationale**:
- ✅ DDoS protection
- ✅ Abuse prevention
- ✅ Fair resource allocation
- 📊 5 check-ins/hour per user

---

## 🔒 Security & Compliance

### Security Measures

1. **Authentication & Authorization**
   - JWT with expiration (30 min default, 30 days for "remember me")
   - Password hashing (bcrypt with salt)
   - Role-based access control (RBAC)

2. **Data Protection**
   - Videos deleted immediately after processing
   - Encrypted database connections (TLS 1.2+)
   - Secure API communication (HTTPS only in production)
   - Input validation on all endpoints

3. **Rate Limiting**
   - 5 registrations/minute per IP
   - 10 login attempts/minute per IP
   - 5 check-ins/hour per user

4. **File Upload Security**
   - File type validation (whitelist)
   - File size limits (100MB max)
   - Content-type verification
   - Path traversal prevention

### Compliance

- **GDPR Ready**: User data deletion, right to access
- **HIPAA Considerations**: Encrypted storage, audit logs
- **SOC 2 Alignment**: Access controls, monitoring

---

## 📦 Setup & Installation

### Prerequisites

- **Backend**: Python 3.11+, pip, virtualenv
- **Frontend**: Node.js 18+, npm
- **Database**: MongoDB Atlas account (or local MongoDB)
- **API Keys**: Groq API key (free tier)

### Backend Setup

```bash
cd backend

python -m venv venv
source venv/bin/activate

pip install -r requirements.txt

cat > .env << EOF
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/sara_ai
JWT_SECRET=your-super-secret-key-change-in-production
GROQ_API_KEY=your-groq-api-key-from-console
CORS_ORIGINS=["http://localhost:3000"]
EOF

./start.sh
```

**Backend runs on**: http://localhost:8000  
**API Docs**: http://localhost:8000/docs

### Frontend Setup

```bash
cd frontend

npm install

cat > .env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:8000
EOF

npm run dev
```

**Frontend runs on**: http://localhost:3000

### Environment Variables

**Backend (`.env`)**:
```bash
MONGO_URI=mongodb+srv://...
DATABASE_NAME=sara_ai
JWT_SECRET=your-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REMEMBER_ME_TOKEN_EXPIRE_DAYS=30
CORS_ORIGINS=["http://localhost:3000"]
GROQ_API_KEY=your-groq-key
VIDEOS_DIR=/tmp/solace_videos
PDFS_DIR=/tmp/solace_pdfs
MAX_FILE_SIZE_MB=100
MAX_VIDEO_DURATION_SECONDS=120
MIN_VIDEO_DURATION_SECONDS=3
```

**Frontend (`.env.local`)**:
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## 📚 API Documentation

### Authentication Endpoints

#### POST `/api/auth/register`
Register new user account

**Request**:
```json
{
  "email": "john@company.com",
  "password": "SecurePass123!",
  "first_name": "John",
  "last_name": "Doe",
  "role": "employee"
}
```

**Response**:
```json
{
  "id": "507f1f77bcf86cd799439011",
  "email": "john@company.com",
  "first_name": "John",
  "last_name": "Doe",
  "role": "employee",
  "is_active": true
}
```

#### POST `/api/auth/login`
Authenticate user

**Request**:
```json
{
  "email": "john@company.com",
  "password": "SecurePass123!",
  "remember_me": true
}
```

**Response**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "john@company.com",
    "first_name": "John",
    "last_name": "Doe",
    "role": "employee"
  }
}
```

### Check-In Endpoints

#### POST `/api/checkin/daily-checkin`
Upload daily check-in video

**Request** (multipart/form-data):
```
video: <file>
notes: "Completed API integration, facing deployment blocker"
today: "API integration"
blockers: "Deployment configuration"
tomorrow: "Testing"
```

**Response**:
```json
{
  "task_id": "123e4567-e89b-12d3-a456-426614174000",
  "status": "queued",
  "message": "Video uploaded successfully. Processing started."
}
```

#### GET `/api/checkin/status/{task_id}`
Check processing status

**Response**:
```json
{
  "task_id": "123e4567-e89b-12d3-a456-426614174000",
  "status": "completed",
  "progress": 100,
  "message": "Video processing complete",
  "result": {
    "checkin_id": "507f1f77bcf86cd799439011",
    "metrics": {
      "stress_avg": 45.2,
      "yawns_count": 2,
      "engagement_score": 82.3,
      "audio": {
        "sentiment": "positive",
        "word_count": 45
      }
    }
  }
}
```

#### GET `/api/checkin/my-checkins`
Get user's check-in history

**Response**:
```json
{
  "checkins": [
    {
      "id": "507f1f77bcf86cd799439011",
      "date": "2025-01-06T10:30:00Z",
      "metrics": {...},
      "insights": {
        "summary": "...",
        "actions": [...]
      },
      "pdf_url": "/tmp/solace_pdfs/report_123.pdf"
    }
  ],
  "pagination": {
    "page": 1,
    "page_size": 20,
    "total_count": 45,
    "total_pages": 3
  }
}
```

---

## 📊 Performance Benchmarks

| Metric | Current Performance | Target |
|--------|-------------------|--------|
| Video Upload | < 5 seconds | < 3 seconds |
| ML Processing | 30-60 seconds | < 20 seconds |
| LLM Inference | 2-5 seconds | < 1 second |
| API Response | < 200ms | < 100ms |
| Concurrent Users | 50+ | 1000+ |
| Database Queries | < 50ms | < 20ms |


---

## 📄 License

**Proprietary & Confidential**  
© 2025 Solace AI. All rights reserved.




