# 🚀 Deployment Guide

## Local Development

### Quick Start (from repo root)
```bash
# Terminal 1: Backend
cd server && PORT=5001 npm run dev

# Terminal 2: AI Service  
cd ai-service && source .venv/bin/activate && uvicorn app:app --reload --port 8001

# Terminal 3: Frontend
cd client && npm run dev
```

Access at `http://localhost:3000`

---

## Production Deployment

### Option 1: Vercel + Render (Recommended for Startups)

#### Vercel (Frontend)
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy from client directory
cd client
vercel deploy --prod

# Set environment variables in Vercel dashboard
NEXT_PUBLIC_API_URL=https://your-api.render.com
NEXT_PUBLIC_DEMO_TOKEN=<leave empty for production>
```

If you import the Git repository directly into Vercel, the project should build the Next.js app from `client`. The repo-level `vercel.json` is configured to point Vercel at `client/package.json`, so the app works even when the repository root is imported.

#### Render (Backend)
1. **Create PostgreSQL Database**
   - Dashboard → PostgreSQL → Create
   - Note the Internal Database URL

2. **Deploy Server**
   - Connect GitHub repo to Render
   - Create New → Web Service
   - Set root directory: `server`
   - Set build command: `npm ci && npm run prisma:generate && npm run build`
   - Set start command: `npm start`
   - Environment variables:
     ```
     NODE_ENV=production
     DATABASE_URL=postgres://...
     JWT_SECRET=<generate strong random string>
     CORS_ORIGIN=https://yourdomain.vercel.app
     UPLOAD_MODE=s3
     AWS_REGION=us-east-1
     AWS_ACCESS_KEY_ID=xxx
     AWS_SECRET_ACCESS_KEY=xxx
     S3_BUCKET=buildtrack-prod
     AI_SERVICE_URL=https://ai-api-xxxxx.render.com
     CLIENT_URL=https://yourdomain.vercel.app
     ```

3. **Deploy AI Service**
   - Create New → Web Service (Python)
   - Build command: `pip install -r requirements.txt`
   - Start command: `uvicorn app:app --host 0.0.0.0 --port $PORT`

#### Database Migration
```bash
# Local development - SQLite
DATABASE_URL="file:./dev.db" npx prisma migrate dev

# Production - PostgreSQL (runs automatically on deploy)
prisma migrate deploy
```

---

### Option 2: Docker Compose (Self-Hosted)

#### Prerequisites
- Docker & Docker Compose installed
- Domain with SSL certificate (Let's Encrypt)
- Server with 2GB+ RAM, 20GB storage

#### Setup
1. **Update docker-compose.yml** with your domain and database password
2. **Deploy**
   ```bash
   docker-compose up -d
   ```

3. **Initialize Database**
   ```bash
   docker exec buildtrack-server npm run seed:prod
   ```

---

### Option 3: AWS (Enterprise)

#### Architecture
```
CloudFront (CDN)
    ↓
Application Load Balancer (ELB)
    ↓
├─ ECS Fargate (Server)
├─ ECS Fargate (AI Service)
└─ RDS PostgreSQL
    ├─ ElastiCache Redis
    └─ S3 (Uploads)
```

#### Deployment Steps
1. **Create RDS PostgreSQL**
   ```bash
   aws rds create-db-instance \
     --db-instance-identifier buildtrack-db \
     --db-instance-class db.t3.micro \
     --engine postgres \
     --master-username admin \
     --master-user-password "<password>"
   ```

2. **Create S3 Bucket**
   ```bash
   aws s3api create-bucket \
     --bucket buildtrack-prod-uploads \
     --acl private
   ```

3. **Build & Push Docker Images**
   ```bash
   # Login to ECR
   aws ecr get-login-password | docker login --username AWS --password-stdin <account>.dkr.ecr.<region>.amazonaws.com

   # Build & push
   docker build -t buildtrack-server server/
   docker tag buildtrack-server:latest <account>.dkr.ecr.<region>.amazonaws.com/buildtrack-server:latest
   docker push <account>.dkr.ecr.<region>.amazonaws.com/buildtrack-server:latest
   ```

4. **Create ECS Cluster & Services**
   - Follow AWS ECS documentation for task definitions
   - Set environment variables from Secrets Manager

---

## Environment Variables Checklist

### Server Production (Never commit `.env` file)
```env
# Required
NODE_ENV=production
DATABASE_URL=postgres://user:pass@host:5432/buildtrack
JWT_SECRET=<generate-strong-random-string>

# Recommended
CORS_ORIGIN=https://yourdomain.com
AI_SERVICE_URL=https://ai-api.yourdomain.com
CLIENT_URL=https://yourdomain.com

# S3 Uploads (recommended over local)
UPLOAD_MODE=s3
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=<IAM user key>
AWS_SECRET_ACCESS_KEY=<IAM user secret>
S3_BUCKET=buildtrack-uploads-prod
```

### Frontend Production
```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
# Don't set demo token in production!
```

---

## Database Migration

### From SQLite to PostgreSQL

1. **Backup SQLite**
   ```bash
   cp server/dev.db server/dev.db.backup
   ```

2. **Update DATABASE_URL** in `.env`
   ```env
   DATABASE_URL=postgres://user:pass@localhost:5432/buildtrack
   ```

3. **Run migrations**
   ```bash
   npx prisma migrate deploy
   npm run seed:prod
   ```

4. **Verify data**
   ```bash
   npx prisma studio
   ```

---

## Scaling Considerations

### Database
- Enable read replicas for high traffic
- Use connection pooling (PgBouncer)
- Regular backups to S3
- Point-in-time recovery enabled

### Caching
- Redis for session management
- Cache API responses (60s TTL)
- Cache AI predictions

### File Storage
- S3 with CloudFront CDN
- Lazy loading for images
- Automatic cleanup of old uploads

### AI Service
- Run on separate instance
- Load balance multiple inference workers
- Cache model predictions
- GPU instance for faster inference

---

## Monitoring & Logging

### Recommended Services
- **Error Tracking**: Sentry (free tier available)
- **Monitoring**: DataDog or New Relic
- **Logs**: CloudWatch, ELK Stack, or Loggly
- **Status**: Statuspage.io

### Setup Example (Sentry)
```javascript
// server/src/index.ts
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: env.nodeEnv,
  tracesSampleRate: 0.1
});

app.use(Sentry.Handlers.errorHandler());
```

---

## CI/CD Pipeline

GitHub Actions automatically runs on every push:
```yaml
✓ Installs dependencies
✓ Type-checks all code
✓ Builds Docker images
✓ Runs security scans
✓ Deploys to staging (on PR)
✓ Deploys to production (on main merge)
```

See `.github/workflows/ci.yml` for details.

---

## SSL/TLS Certificates

### Automatic (Recommended)
- **Vercel**: Automatically managed
- **Render**: Free with letsencrypt
- **AWS**: Use AWS Certificate Manager

### Manual Setup (self-hosted)
```bash
# Using certbot
sudo certbot certonly --standalone -d yourdomain.com
sudo certbot renew  # Set auto-renewal via cron
```

---

## Backup & Recovery

### Automated Daily Backups
```bash
# Add to crontab
0 2 * * * pg_dump buildtrack > /backups/buildtrack-$(date +%Y%m%d).sql
```

### Restore from Backup
```bash
psql buildtrack < buildtrack-20260511.sql
```

---

## Performance Optimization

### Frontend
- [ ] Enable Vercel Analytics
- [ ] Image optimization with next/image
- [ ] Code splitting for routes
- [ ] Minify and compress assets

### Backend
- [ ] Enable database query logging
- [ ] Cache common queries
- [ ] Use Redis for sessions
- [ ] Compress API responses (gzip)

### AI Service
- [ ] Batch predictions when possible
- [ ] Cache model outputs
- [ ] Use GPU instances
- [ ] Implement request queuing

---

## Troubleshooting

### Database Connection Failed
```bash
# Test connection
psql -h <host> -U <user> -d buildtrack

# Check prisma schema
npx prisma db push --force-reset
```

### Uploads Not Working
```bash
# Check S3 credentials
aws s3 ls

# Check bucket permissions
aws s3api get-bucket-policy --bucket <bucket>
```

### High Latency
1. Check database query performance
2. Enable Redis caching
3. Use CDN for static assets
4. Monitor AI service inference time

---

## Security Hardening for Production

See [SECURITY.md](./SECURITY.md) for detailed security checklist.
