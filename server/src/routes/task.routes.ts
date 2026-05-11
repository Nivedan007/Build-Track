import { Router } from "express";
import { z } from "zod";
import { prisma } from "../config/prisma";
import { requireAuth, requireRoles } from "../middleware/auth";

const router = Router();

router.get("/", requireAuth, async (_req, res) => {
  const tasks = await prisma.task.findMany({
    include: {
      assignee: { select: { id: true, name: true, email: true } },
      project: { select: { id: true, title: true } }
    },
    orderBy: { createdAt: "desc" }
  });

  return res.json({ tasks });
});

router.post("/", requireAuth, requireRoles("ADMIN", "PROJECT_MANAGER", "SITE_ENGINEER"), async (req, res) => {
  const parsed = z
    .object({
      title: z.string().min(3),
      description: z.string().optional(),
      projectId: z.string(),
      assignedTo: z.string().optional(),
      dueDate: z.string().datetime(),
      priority: z.enum(["LOW", "MEDIUM", "HIGH"]).default("MEDIUM")
    })
    .safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ message: "Validation failed", errors: parsed.error.flatten() });
  }

  const task = await prisma.task.create({
    data: {
      ...parsed.data,
      dueDate: new Date(parsed.data.dueDate)
    }
  });

  return res.status(201).json({ task });
});

router.patch("/:id", requireAuth, requireRoles("ADMIN", "PROJECT_MANAGER", "SITE_ENGINEER", "WORKER"), async (req, res) => {
  const taskId = String(req.params.id);

  const parsed = z
    .object({
      status: z.enum(["PENDING", "IN_PROGRESS", "COMPLETED", "DELAYED"]).optional(),
      proofUrl: z.string().url().optional()
    })
    .safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ message: "Validation failed", errors: parsed.error.flatten() });
  }

  const task = await prisma.task.update({
    where: { id: taskId },
    data: parsed.data
  });

  return res.json({ task });
});

export default router;
