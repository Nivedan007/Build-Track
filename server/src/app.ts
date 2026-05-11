import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { env } from "./config/env";
import authRoutes from "./routes/auth.routes";
import projectRoutes from "./routes/project.routes";
import taskRoutes from "./routes/task.routes";
import aiRoutes from "./routes/ai.routes";
import uploadRoutes from "./routes/upload.routes";
import reportRoutes from "./routes/report.routes";
import teamRoutes from "./routes/team.routes";
import { errorHandler } from "./middleware/errorHandler";

const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      mediaSrc: ["'self'", "https:"],
      connectSrc: ["'self'", "http://localhost:*", "ws://localhost:*"]
    }
  },
  hsts: { maxAge: 31536000, includeSubDomains: true },
  frameguard: { action: "deny" },
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  noSniff: true,
  xssFilter: true
}));

// CORS with strict origin checking
app.use(
  cors({
    origin: [env.corsOrigin, env.clientUrl],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    maxAge: 86400
  })
);

// Request parsing with size limits
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ limit: "2mb", extended: true }));

// Rate limiting: strict for auth, moderate for general
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: "Too many login attempts, please try again later",
  standardHeaders: true,
  legacyHeaders: false
});

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300, // 300 requests per 15 minutes
  standardHeaders: true,
  legacyHeaders: false
});

// Apply rate limiting
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);
app.use(generalLimiter);

// Health check
app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "buildtrack-server", env: env.nodeEnv });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/uploads", uploadRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/team", teamRoutes);

// Serve uploaded files with security headers
import path from "path";
app.use("/uploads", express.static(path.join(__dirname, "../../uploads"), {
  maxAge: "1d",
  etag: false
}));

// 404 handler
app.use("*", (_req, res) => {
  res.status(404).json({ message: "Not found" });
});

// Error handler (must be last)
app.use(errorHandler);

export default app;
