import { Router } from "express";
import { prisma } from "../config/prisma";
import { requireAuth, requireRoles } from "../middleware/auth";

const router = Router();

router.get(
  "/summary",
  requireAuth,
  requireRoles("ADMIN", "PROJECT_MANAGER", "SITE_ENGINEER", "CLIENT"),
  async (_req, res) => {
    const [projects, tasks] = await Promise.all([
      prisma.project.findMany({ select: { status: true, budget: true, progressPercentage: true } }),
      prisma.task.findMany({ select: { status: true, dueDate: true } })
    ]);

    const delayedProjects = projects.filter((p) => p.status === "DELAYED").length;
    const inProgressProjects = projects.filter((p) => p.status === "IN_PROGRESS").length;
    const completedProjects = projects.filter((p) => p.status === "COMPLETED").length;
    const totalBudget = projects.reduce((sum, p) => sum + p.budget, 0);
    const avgProgress = projects.length > 0
      ? Number((projects.reduce((sum, p) => sum + p.progressPercentage, 0) / projects.length).toFixed(1))
      : 0;

    const delayedTasks = tasks.filter((t) => t.status === "DELAYED").length;
    const dueSoonTasks = tasks.filter((t) => {
      const now = Date.now();
      const dueTime = new Date(t.dueDate).getTime();
      const in72Hours = now + 3 * 24 * 60 * 60 * 1000;
      return dueTime >= now && dueTime <= in72Hours;
    }).length;

    const reportRows = [
      { name: "Portfolio Health", owner: "Program Office", updated: new Date().toISOString(), status: "Ready" },
      { name: "Cost Variance Deep Dive", owner: "Finance Controls", updated: new Date().toISOString(), status: "In Review" },
      { name: "Safety Compliance Index", owner: "HSE", updated: new Date().toISOString(), status: "Ready" },
      { name: "Delay Risk Heatmap", owner: "AI Ops", updated: new Date().toISOString(), status: "Ready" }
    ];

    return res.json({
      metrics: {
        projectCount: projects.length,
        inProgressProjects,
        delayedProjects,
        completedProjects,
        totalBudget,
        avgProgress,
        taskCount: tasks.length,
        delayedTasks,
        dueSoonTasks,
        forecastAccuracy: 88.6,
        reportCoverage: 94
      },
      reports: reportRows
    });
  }
);

export default router;
