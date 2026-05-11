# 🔒 Security Guide

## Overview

This document outlines security best practices for BuildTrack AI in production environments.

---

## Authentication & Authorization

### JWT Configuration
✅ **Implemented**
```javascript
// src/utils/jwt.ts
signToken({ userId, role, email })  // Payload
// Expires: 24 hours (configurable)
// Algorithm: HS256 with strong secret
```

### Production Checklist
- [ ] Change `JWT_SECRET` to cryptographically random string (32+ chars)
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```
- [ ] Use different secrets per environment (dev, staging, prod)
- [ ] Enable token refresh rotation
- [ ] Implement token blacklist for logout

### Password Security
✅ **Implemented (bcryptjs)**
```javascript
// Passwords hashed with bcrypt, 10 salt rounds
await bcrypt.hash(password, 10)
```

### OAuth2 / Social Login
```javascript
// To add Google OAuth
npm install next-auth @auth/core
// Configure in client/src/auth.config.ts
```

---

## Transport Security

### HTTPS/TLS
✅ **Helmet.js Configured**

**Production Checklist**
- [ ] Use certificates from trusted CA (Let's Encrypt, AWS ACM)
- [ ] Enable HSTS header (max-age: 31536000)
- [ ] Force HTTPS redirect
  ```javascript
  // In app.ts
  app.use((req, res, next) => {
    if (process.env.NODE_ENV === 'production' && !req.secure) {
      return res.redirect(`https://${req.host}${req.url}`);
    }
    next();
  });
  ```
- [ ] Enable TLS 1.2 minimum
- [ ] Use strong cipher suites

### Certificate Pinning
```javascript
// For API calls from client
const instance = axios.create({
  httpsAgent: new https.Agent({
    ca: fs.readFileSync('path/to/cert.pem')
  })
});
```

---

## API Security

### Rate Limiting
✅ **Implemented (express-rate-limit)**

Current Configuration:
- Auth endpoints: 5 requests per 15 minutes
- General API: 300 requests per 15 minutes

**Enhance for production**
```javascript
// server/src/app.ts
const createLimiter = (max) => rateLimit({
  windowMs: 15 * 60 * 1000,
  max,
  skip: (req) => req.user?.role === 'ADMIN', // Skip for admins
  keyGenerator: (req) => req.user?.id || req.ip,
  handler: (req, res) => res.status(429).json({ error: 'Too many requests' })
});
```

### CORS Protection
✅ **Implemented**
```javascript
// Only allow specific origins
app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
}));
```

### Input Validation
✅ **Implemented (Zod)**
```typescript
// Validate all inputs
const createProjectSchema = z.object({
  title: z.string().min(1).max(255),
  budget: z.number().positive(),
  deadline: z.date(),
  // ... more fields
});

const project = createProjectSchema.parse(req.body);
```

### Content Security Policy
✅ **Implemented (Helmet.js)**
```javascript
helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "https:"],
      connectSrc: ["'self'", "https://api.yourdomain.com"]
    }
  }
})
```

### SQL Injection
✅ **Protected by Prisma ORM**
Prisma uses parameterized queries automatically.

---

## Data Protection

### File Upload Security
✅ **Implemented**
- MIME type validation
- File size limits (10MB)
- Random filename generation

**Additional measures**
```javascript
// server/src/routes/upload.routes.ts
const fileFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'application/pdf'];
  if (!allowedMimes.includes(file.mimetype)) {
    cb(new Error('Invalid file type'));
  } else {
    cb(null, true);
  }
};

// Scan uploads for malware (in production)
const scanFile = async (filePath) => {
  // Use ClamAV or similar service
  const result = await clamav.scanFile(filePath);
  if (result.isInfected) {
    fs.unlinkSync(filePath);
    throw new Error('Malicious file detected');
  }
};
```

### S3 Security
✅ **Configured for local, ready for S3**

**For S3 in production**
```javascript
// Bucket policy: Private by default
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "DenyPublicRead",
      "Effect": "Deny",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::buildtrack-uploads/*"
    }
  ]
}

// Serve via CloudFront with signed URLs
const signedUrl = s3.getSignedUrl('getObject', {
  Bucket: 'buildtrack-uploads',
  Key: file.key,
  Expires: 3600 // 1 hour
});
```

### Database Encryption
- [ ] Enable RDS encryption at rest
  ```bash
  aws rds modify-db-instance \
    --db-instance-identifier buildtrack-db \
    --storage-encrypted \
    --apply-immediately
  ```
- [ ] Use VPC for database (not internet-facing)
- [ ] Enable encryption in transit (SSL)

### Sensitive Data
- [ ] Never log passwords, tokens, API keys
- [ ] Sanitize logs before shipping to third-party services
- [ ] PII: Hash email addresses if not needed in plaintext

```javascript
// Use sensitive data redaction
import * as Sentry from "@sentry/node";

Sentry.init({
  beforeSend(event) {
    // Remove sensitive fields
    if (event.request) {
      delete event.request.headers.authorization;
      delete event.request.cookies;
    }
    return event;
  }
});
```

---

## Infrastructure Security

### Environment Variables
✅ **Implemented**

**Checklist**
- [ ] Store secrets in environment, not code
- [ ] Use Secrets Manager (AWS, Azure, Vault)
- [ ] Rotate secrets regularly (quarterly)
- [ ] Audit secret access

```bash
# Never do this:
DB_PASSWORD="secret123" npm start

# Do this:
aws secretsmanager get-secret-value --secret-id buildtrack/db-password
```

### Network Security
- [ ] Enable VPC (Virtual Private Cloud)
- [ ] Use security groups (firewall rules)
- [ ] Enable WAF (Web Application Firewall)
- [ ] DDoS protection (AWS Shield, Cloudflare)

### Infrastructure as Code
- [ ] Store all infrastructure in version control
- [ ] Use secrets management (not in code)
- [ ] Enable audit logging for all changes

---

## Application Security

### Dependency Management
✅ **GitHub Actions CI includes vulnerability scanning**

**Maintain in production**
```bash
# Check for vulnerabilities
npm audit

# Update dependencies
npm update

# Automated updates
# Use Dependabot in GitHub
```

### Logging & Monitoring
- [ ] Enable application logging (DEBUG, INFO, WARN, ERROR)
- [ ] Send logs to centralized service (CloudWatch, ELK)
- [ ] Set up alerts for suspicious activity
- [ ] Monitor failed login attempts

```javascript
// Log suspicious activities
logger.warn('Failed login attempt', {
  email,
  ip: req.ip,
  timestamp: new Date().toISOString()
});
```

### Error Handling
✅ **Implemented error middleware**

**Ensure production-safe errors**
```javascript
// server/src/middleware/errorHandler.ts
if (env.nodeEnv === 'production') {
  // Don't expose internal error details
  return res.status(500).json({
    message: 'Internal server error',
    // Don't include: stack, queries, etc.
  });
}
```

---

## Compliance & Privacy

### GDPR
- [ ] Data export endpoint (user's right to data)
- [ ] Data deletion endpoint (right to be forgotten)
- [ ] Privacy policy and terms of service
- [ ] Consent for tracking/analytics

### CCPA
- [ ] California consumer rights
- [ ] Data inventory
- [ ] Breach notification procedures

### Data Retention
```javascript
// Auto-delete old uploads after 90 days
const deleteOldUploads = async () => {
  const cutoff = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
  await prisma.upload.deleteMany({
    where: { createdAt: { lt: cutoff } }
  });
};

// Run daily
schedule.scheduleJob('0 2 * * *', deleteOldUploads);
```

---

## Security Testing

### Manual Testing
- [ ] Test authentication bypass
- [ ] Test authorization (access other user's data)
- [ ] Test input validation (SQL injection, XSS)
- [ ] Test rate limits

### Automated Testing
```bash
# OWASP ZAP scanning
docker run -t owasp/zap2docker-stable \
  zap-baseline.py -t http://localhost:5001

# npm audit
npm audit

# Trivy image scanning
trivy image buildtrack-server:latest
```

### Penetration Testing
- [ ] Hire professional pen testers quarterly
- [ ] Perform internal security reviews
- [ ] Bug bounty program (HackerOne, Bugcrowd)

---

## Incident Response

### Breach Response Plan
1. **Identify**: Determine scope and severity
2. **Contain**: Stop the attack
3. **Notify**: Inform users within 72 hours (GDPR)
4. **Fix**: Patch the vulnerability
5. **Monitor**: Watch for re-occurrence

### Backup & Recovery
```bash
# Daily backups
0 2 * * * pg_dump buildtrack | gzip > /backups/db-$(date +%Y%m%d).sql.gz

# Test restore weekly
pg_restore --verbose --clean --if-exists \
  --no-acl --no-owner -h localhost -U postgres \
  /backups/db-latest.sql.gz
```

---

## Security Headers (All Implemented)

```javascript
// helmet.js in app.ts provides:
✓ Content-Security-Policy
✓ Strict-Transport-Security (HSTS)
✓ X-Frame-Options (Clickjacking protection)
✓ X-Content-Type-Options (MIME sniffing protection)
✓ X-XSS-Protection
✓ Referrer-Policy
✓ Permissions-Policy
```

---

## Checklist for Production Deployment

### Before Going Live
- [ ] All environment variables set (not default values)
- [ ] Database backups configured
- [ ] Monitoring and alerting enabled
- [ ] SSL certificates installed
- [ ] WAF rules configured
- [ ] Rate limiting tested
- [ ] Logging enabled
- [ ] Error tracking (Sentry) configured
- [ ] Team trained on security practices
- [ ] Security policy document created
- [ ] Incident response plan in place
- [ ] Regular security audit scheduled (monthly)
- [ ] Penetration testing completed
- [ ] Bug bounty program active

### Ongoing
- [ ] Weekly: Check for security updates
- [ ] Monthly: Review logs and access patterns
- [ ] Quarterly: Update dependencies, patch security vulnerabilities
- [ ] Annually: Full security audit, penetration test

---

## Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [CWE Top 25](https://cwe.mitre.org/top25/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Express Security](https://expressjs.com/en/advanced/best-practice-security.html)
- [GDPR Compliance](https://gdpr-info.eu/)

---

**Last Updated**: May 2026  
**Maintained By**: Security Team
