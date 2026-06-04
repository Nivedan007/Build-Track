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

router.post("/optimize-workflow", requireAuth, async (req, res) => {
  const parsed = z
    .object({
      weatherRisk: z.number().min(0).max(1),
      crewUtilization: z.number().min(0).max(1),
      materialReadiness: z.number().min(0).max(1),
      taskBacklog: z.number().int().min(0),
      overtimeHours: z.number().min(0).max(24),
      currentProgress: z.number().min(0).max(100),
      skillMatch: z.number().min(0).max(1)
    })
    .safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ message: "Validation failed", errors: parsed.error.flatten() });
  }

  const response = await axios.post(`${env.aiServiceUrl}/optimize-workflow`, parsed.data);
  return res.json(response.data);
});

router.post("/predict-cost-overrun", requireAuth, async (req, res) => {
  const parsed = z
    .object({
      projectBudget: z.number().min(1000),
      durationDays: z.number().int().min(1),
      taskCount: z.number().int().min(1),
      highPriorityTaskCount: z.number().int().min(0),
      averageAttendanceRate: z.number().min(0).max(1),
      weatherRisk: z.number().min(0).max(1),
      materialShortages: z.number().int().min(0)
    })
    .safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ message: "Validation failed", errors: parsed.error.flatten() });
  }

  try {
    const response = await axios.post(`${env.aiServiceUrl}/predict-cost-overrun`, parsed.data);
    return res.json(response.data);
  } catch (error: any) {
    console.error("AI Service Error:", error.message);
    return res.status(500).json({ message: "AI service failed to process request" });
  }
});

router.post("/predict-safety-risk", requireAuth, async (req, res) => {
  const parsed = z
    .object({
      workerCount: z.number().int().min(1),
      overtimeHoursAverage: z.number().min(0).max(24),
      safetyCertRate: z.number().min(0).max(1),
      weatherSeverity: z.number().min(0).max(1),
      scaffoldingActivity: z.number().min(0).max(1),
      heavyMachineryCount: z.number().int().min(0),
      lastSafetyAuditDays: z.number().int().min(0)
    })
    .safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ message: "Validation failed", errors: parsed.error.flatten() });
  }

  try {
    const response = await axios.post(`${env.aiServiceUrl}/predict-safety-risk`, parsed.data);
    return res.json(response.data);
  } catch (error: any) {
    console.error("AI Service Error:", error.message);
    return res.status(500).json({ message: "AI service failed to process request" });
  }
});

export default router;
