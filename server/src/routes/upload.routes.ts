import { Router, Request } from "express";
import multer from "multer";
import { activeStorage, s3Storage } from "../config/storage";
import { env } from "../config/env";
import { requireAuth } from "../middleware/auth";

const router = Router();

const upload = multer({
  storage: activeStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB max
  fileFilter: (_req: any, file: any, cb: any) => {
    const allowedMimes = ["image/jpeg", "image/png", "application/pdf", "image/webp"];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only JPEG, PNG, PDF, and WebP are allowed."));
    }
  }
});

router.post("/task-proof", requireAuth, upload.single("proof"), (req: Request, res) => {
  try {
    const r: any = req as any;
    if (!r.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Handle both local and S3 uploads
    let url: string;
    if (env.uploadMode === "s3" && s3Storage && r.file.location) {
      // S3 upload: use the location provided by multer-s3
      url = r.file.location;
    } else {
      // Local upload: construct the URL
      url = `/uploads/${r.file.filename}`;
    }

    return res.json({
      url,
      filename: r.file.filename || r.file.key,
      size: r.file.size,
      mimetype: r.file.mimetype
    });
  } catch (error: any) {
    console.error("Upload error:", error);
    return res.status(500).json({ message: error.message || "Upload failed" });
  }
});

export default router;
