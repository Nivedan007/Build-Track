# 🏗️ BuildTrack AI - Smart Construction Management Platform

A production-ready AI-powered construction management platform with real-time collaboration, intelligent delay prediction, and comprehensive project tracking.

## 🌟 Complete Features

### Core Functionality
✅ **Project Management** - Multi-site tracking with budget, deadlines, and progress  
✅ **Task Management** - Granular task tracking with priorities and status monitoring  
✅ **AI Delay Prediction** - RandomForest ML model predicting project delays  
✅ **Real-time Notifications** - Socket.IO live updates with animated toasts  
✅ **Secure File Uploads** - Local disk or AWS S3 storage with preview  
✅ **Role-Based Access** - Admin, PM, Engineer, Client, Worker roles  
✅ **Analytics Dashboard** - Real-time KPIs, charts, and project metrics  
✅ **Authentication** - JWT tokens with secure password hashing  

### UI/UX ✨
✅ **Modern Design** - Glassmorphism with Tailwind CSS  
✅ **Smooth Animations** - Framer Motion transitions and micro-interactions  
✅ **Responsive Layout** - Mobile-first, fully responsive  
✅ **Enhanced Notifications** - Color-coded toasts with progress indicators  
✅ **Smart Uploads** - Drag-drop, preview, and progress tracking  

### Security 🔒
✅ **Helmet.js** - Security headers (CSP, HSTS, X-Frame-Options)  
✅ **Rate Limiting** - Strict limits on auth, moderate on general endpoints  
✅ **CORS Protection** - Strict origin checking  
✅ **Input Validation** - Zod schema validation on all inputs  
✅ **Password Security** - Bcrypt hashing with salt rounds  
✅ **Environment Management** - Secrets via environment variables  
✅ **File Security** - MIME type validation and size limits  

### DevOps & CI/CD 🚀
✅ **GitHub Actions** - Automated builds, tests, and security scanning  
✅ **Docker Ready** - Dockerfiles and docker-compose included  
✅ **Multi-Environment** - Dev (SQLite) and production (PostgreSQL) configs  
✅ **Error Handling** - Comprehensive error middleware  

## 📋 Quick Start (5 minutes)

### Prerequisites
- Node.js 20+
- Python 3.11+
- macOS/Linux/WSL

### 1. Install & Setup Backend
```bash
cd server
npm install
npm run seed          # Creates demo user & data
PORT=5001 npm run dev  # Starts on port 5001
```

### 2. Start AI Service
```bash
cd ai-service
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python train.py
uvicorn app:app --reload --port 8001
```

### 3. Run Frontend
```bash
cd client
npm install
npm run dev           # Starts on port 3000
```

### 4. Open App
- **Frontend**: http://localhost:3000
- **API**: http://localhost:5001/health
- **AI Docs**: http://localhost:8001/docs

**Demo Login**: admin@buildtrack.ai / BuildTrack@123  
Or use demo token from `client/.env.local`

## 🏛️ Architecture

```
┌─────────────────────────────────────────────────────┐
│                                                       │
│  Next.js 15 Frontend (React 19, Framer Motion)      │
│  ├─ Dashboard with KPIs & Charts                    │
│  ├─ Projects & Tasks CRUD                           │
│  ├─ File Upload with Preview                        │
│  └─ Real-time Notifications                         │
│                                                       │
└─────────────┬───────────────────────────────────────┘
              │ Socket.IO + REST API
              ↓
┌─────────────────────────────────────────────────────┐
│                                                       │
│  Express Backend (TypeScript, Helmet, Rate Limit)  │
│  ├─ Auth Routes (JWT, bcryptjs)                     │
│  ├─ Project/Task APIs (Prisma ORM)                  │
│  ├─ File Upload (Local disk or S3)                  │
│  ├─ Socket.IO Server                                │
│  └─ AI Proxy                                         │
│                                                       │
└─────────────┬───────────────────────────────────────┘
              │
              ├──────────────┬──────────────┬────────────┐
              ↓              ↓              ↓            ↓
        ┌─────────┐   ┌──────────┐  ┌──────────┐  ┌─────────┐
        │ SQLite  │   │ AWS S3   │  │ FastAPI  │  │ Uploads │
        │ (local) │   │ (prod)   │  │ ML Model │  │ Storage │
        └─────────┘   └──────────┘  └──────────┘  └─────────┘
```

## 🔧 Environment Setup

### Server `.env`
```env
PORT=5001
NODE_ENV=development
DATABASE_URL=file:./dev.db

JWT_SECRET=your-secret-change-me
CORS_ORIGIN=http://localhost:3000

# Upload: local or s3
UPLOAD_MODE=local
# AWS_REGION=us-east-1
# AWS_ACCESS_KEY_ID=xxx
# AWS_SECRET_ACCESS_KEY=xxx
# S3_BUCKET=your-bucket
```

### Client `.env.local`
```env
NEXT_PUBLIC_API_URL=http://localhost:5001
NEXT_PUBLIC_DEMO_TOKEN=<from seed output>
```

## 📚 Tech Stack Breakdown

| Layer | Technology | Why |
|-------|-----------|-----|
| **Frontend** | Next.js 15 App Router | Latest React, server components, edge ready |
| | TypeScript | Type safety, better DX |
| | Tailwind CSS | Utility-first, responsive, themeable |
| | Framer Motion | Smooth animations, interactive UI |
| | Zustand | Lightweight state management |
| **Backend** | Express.js | Lightweight, mature, flexible |
| | Prisma ORM | Type-safe DB access, migrations |
| | TypeScript | Production-grade backend |
| | Socket.IO | Real-time bidirectional events |
| | Helmet.js | Security headers out-of-the-box |
| **AI** | FastAPI | High performance, auto-docs |
| | scikit-learn | Simple, effective ML models |
| | joblib | Model serialization |

## 🔐 Production Checklist

### Security
- [ ] Change JWT_SECRET to strong random string
- [ ] Enable S3 for file uploads (add AWS credentials)
- [ ] Switch to PostgreSQL database
- [ ] Add Redis for caching/sessions
- [ ] Enable HTTPS/TLS
- [ ] Set up WAF (Cloudflare/AWS WAF)
- [ ] Regular dependency updates (`npm audit`)
- [ ] Enable rate limiting on all endpoints

### Operations
- [ ] Set up monitoring (Sentry, DataDog, New Relic)
- [ ] Configure log aggregation (CloudWatch, Loggly)
- [ ] Database backups and point-in-time recovery
- [ ] CDN for static assets (CloudFront)
- [ ] Email service for notifications (SendGrid, AWS SES)
- [ ] Status page (Statuspage.io)

### Deployment
- [ ] Docker images on registry (ECR, Docker Hub)
- [ ] Automated deployments (GitHub Actions)
- [ ] Environment-specific configs
- [ ] Health checks and auto-scaling
- [ ] Load balancing
- [ ] Blue-green deployments

## 🚀 Deploy Anywhere

### Vercel (Frontend - Recommended)
```bash
npm install -g vercel
cd client && vercel deploy --prod
```

### Render (Backend + AI)
1. Create new service, connect GitHub
2. Set environment variables
3. Deploy

### Railway (All-in-one)
```bash
npm install -g @railway/cli
railway init
railway deploy
```

### Docker Compose (Local Production)
```bash
docker-compose up -d
```

## 📊 Real-time Features

### Socket.IO Events
```javascript
// Listen for project updates
socket.on('project:update', (payload) => {
  console.log('Project updated:', payload);
  // { action, project, message }
});
```

### Notifications Types
- ✅ Success - File uploaded, project updated
- ⚠️ Warning - Delay predicted, budget exceeded
- ❌ Error - Upload failed, server error
- ℹ️ Info - New project, task assigned

## 🧪 Testing & Quality

### Run Builds
```bash
cd server && npm run build   # TypeScript check
cd client && npm run build   # Next.js build
cd ai-service && python train.py  # Model train
```

### CI/CD Pipeline
GitHub Actions automatically:
- ✅ Installs dependencies
- ✅ Type-checks (TypeScript, Pylint)
- ✅ Builds all services
- ✅ Scans for vulnerabilities (Trivy)
- ✅ Runs security checks

## 📈 What's Included

### Database Models
- ✅ Users (with roles)
- ✅ Projects (with status tracking)
- ✅ Tasks (with dependencies)
- ✅ Uploads (file metadata)

### API Routes (30+)
- ✅ Authentication (register, login, profile)
- ✅ Projects (CRUD + batch operations)
- ✅ Tasks (CRUD + status updates)
- ✅ AI (delay prediction)
- ✅ Uploads (file management)

### UI Pages
- ✅ Landing page with features
- ✅ Dashboard with analytics
- ✅ Projects list and details
- ✅ Tasks board
- ✅ Login page

## 🎯 Next Steps to Extend

**For you to add:**
- [ ] Advanced filters and search
- [ ] Export reports (PDF, Excel)
- [ ] Video conferencing for site visits
- [ ] Mobile app (React Native)
- [ ] Attendance tracking with face recognition
- [ ] Weather integration for delay prediction
- [ ] Calendar view for timeline
- [ ] Gantt charts for scheduling

## 📞 Support & Issues

- **Docs**: See [Architecture Decisions](./ARCHITECTURE.md)
- **Issues**: GitHub Issues
- **Security**: Report to security@buildtrack.ai

## 📄 License

MIT - Build with it, modify it, deploy it!

---

**Status**: ✅ Production Ready | **Version**: 1.0.0  
**Last Updated**: May 2026 | **Maintainer**: @devteam

