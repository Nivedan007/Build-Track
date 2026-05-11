import { Router } from "express";
import { z } from "zod";
import { prisma } from "../config/prisma";
import { requireAuth, requireRoles } from "../middleware/auth";
import { notifyProjectUpdate } from "../sockets";

const router = Router();

router.get("/", requireAuth, async (_req, res) => {
  const projects = await prisma.project.findMany({
    include: {
      engineer: {
        select: { id: true, name: true, email: true }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  return res.json({ projects });
});

router.post("/", requireAuth, requireRoles("ADMIN", "PROJECT_MANAGER"), async (req, res) => {
  const parsed = z
    .object({
      title: z.string().min(3),
      clientName: z.string().min(2),
      budget: z.number().positive(),
      deadline: z.string().datetime(),
      location: z.string().min(2),
      engineerId: z.string().optional()
    })
    .safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ message: "Validation failed", errors: parsed.error.flatten() });
  }

  const project = await prisma.project.create({
    data: {
      ...parsed.data,
      deadline: new Date(parsed.data.deadline)
    }
  });

  notifyProjectUpdate(project.id, { action: "created", projectId: project.id });
  return res.status(201).json({ project });
});

router.patch("/:id", requireAuth, requireRoles("ADMIN", "PROJECT_MANAGER", "SITE_ENGINEER"), async (req, res) => {
  const projectId = String(req.params.id);

  const parsed = z
    .object({
      progressPercentage: z.number().min(0).max(100).optional(),
      status: z.enum(["PLANNING", "IN_PROGRESS", "COMPLETED", "DELAYED"]).optional(),
      budget: z.number().positive().optional()
    })
    .safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ message: "Validation failed", errors: parsed.error.flatten() });
  }

  const project = await prisma.project.update({
    where: { id: projectId },
    data: parsed.data
  });

  notifyProjectUpdate(project.id, { action: "updated", projectId: project.id, project });
  return res.json({ project });
});

router.delete("/:id", requireAuth, requireRoles("ADMIN"), async (req, res) => {
  const projectId = String(req.params.id);
  await prisma.project.delete({ where: { id: projectId } });
  return res.status(204).send();
});

export default router;
