import dotenv from "dotenv";

dotenv.config();

export const env = {
  port: Number(process.env.PORT || 5001),
  databaseUrl: process.env.DATABASE_URL || "",
  jwtSecret: process.env.JWT_SECRET || "",
  aiServiceUrl: process.env.AI_SERVICE_URL || "http://localhost:8001",
  clientUrl: process.env.CLIENT_URL || "http://localhost:3000",
  // Upload config
  uploadMode: (process.env.UPLOAD_MODE || "local") as "local" | "s3",
  // S3 config
  awsRegion: process.env.AWS_REGION || "us-east-1",
  awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
  awsSecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  s3Bucket: process.env.S3_BUCKET || "",
  // Security
  nodeEnv: process.env.NODE_ENV || "development",
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:3000",
  allowedOrigins: [
    process.env.CORS_ORIGIN,
    process.env.CLIENT_URL,
    "http://localhost:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001"
  ]
    .filter(Boolean)
    .flatMap((origin) => String(origin).split(",").map((entry) => entry.trim()))
    .filter(Boolean)
    .filter((origin, index, list) => list.indexOf(origin) === index)
};

if (!env.jwtSecret) {
  throw new Error("Missing JWT_SECRET in environment");
}

// Warn if S3 is configured but credentials are missing
if (env.uploadMode === "s3") {
  if (!env.awsAccessKeyId || !env.awsSecretAccessKey || !env.s3Bucket) {
    console.warn("⚠️  S3 upload mode selected but AWS credentials missing. Falling back to local storage.");
  }
}
