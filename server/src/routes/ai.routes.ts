import { Router } from "express";
import axios from "axios";
import { z } from "zod";
import { env } from "../config/env";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.post("/predict-delay", requireAuth, async (req, res) => {
  const parsed = z
    .object({
      weatherRisk: z.number().min(0).max(1),
      pastDelays: z.number().min(0),
      attendanceRate: z.number().min(0).max(1),
      materialShortages: z.number().min(0),
      currentProgress: z.number().min(0).max(100)
    })
    .safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ message: "Validation failed", errors: parsed.error.flatten() });
  }

  const response = await axios.post(`${env.aiServiceUrl}/predict-delay`, parsed.data);
  return res.json(response.data);
});

export default router;
