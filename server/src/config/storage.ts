import multer from "multer";
import path from "path";
import fs from "fs";
import { env } from "./env";
import { v4 as uuidv4 } from "uuid";

const uploadDir = path.join(process.cwd(), "uploads");

// Ensure uploads directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Local storage configuration
export const localStorage = multer.diskStorage({
  destination: (_req: any, _file: any, cb: any) => cb(null, uploadDir),
  filename: (_req: any, file: any, cb: any) => {
    const safe = `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, "_")}`;
    cb(null, safe);
  }
});

// S3 storage configuration (placeholder - requires multer-s3)
export let s3Storage: any = null;

if (env.uploadMode === "s3" && env.awsAccessKeyId && env.awsSecretAccessKey && env.s3Bucket) {
  try {
    const { S3Client } = require("@aws-sdk/client-s3");
    const multerS3 = require("multer-s3");

    const s3Client = new S3Client({
      region: env.awsRegion,
      credentials: {
        accessKeyId: env.awsAccessKeyId,
        secretAccessKey: env.awsSecretAccessKey
      }
    });

    s3Storage = multerS3({
      s3: s3Client,
      bucket: env.s3Bucket,
      acl: "public-read",
      metadata: function (_req: any, file: any, cb: any) {
        cb(null, { fieldname: file.fieldname });
      },
      key: function (_req: any, file: any, cb: any) {
        const key = `uploads/${uuidv4()}-${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, "_")}`;
        cb(null, key);
      }
    });
  } catch (error) {
    console.error("Failed to initialize S3 storage:", error);
    console.warn("Falling back to local storage");
  }
}

// Export active storage (S3 if configured, else local)
export const activeStorage = s3Storage || localStorage;
