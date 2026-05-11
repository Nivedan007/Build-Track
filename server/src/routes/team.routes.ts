import { Router } from "express";
import { prisma } from "../config/prisma";
import { requireAuth, requireRoles } from "../middleware/auth";

const router = Router();

router.get(
  "/overview",
  requireAuth,
  requireRoles("ADMIN", "PROJECT_MANAGER", "SITE_ENGINEER"),
  async (_req, res) => {
    const users = await prisma.user.findMany({
      where: {
        role: {
          in: ["ADMIN", "PROJECT_MANAGER", "SITE_ENGINEER", "WORKER"]
        }
      },
      include: {
        tasks: {
          select: {
            id: true,
            status: true
          }
        }
      },
      orderBy: {
        createdAt: "asc"
      }
    });

    const team = users.map((user) => {
      const assignedCount = user.tasks.length;
      const completedCount = user.tasks.filter((task) => task.status === "COMPLETED").length;
      const utilization = Math.min(98, 45 + assignedCount * 11);

      return {
        id: user.id,
        name: user.name,
        role: user.role,
        location: "India",
        assignedCount,
        completedCount,
        utilization,
        status: assignedCount > 0 ? "Active" : "Available"
      };
    });

    const averageUtilization =
      team.length > 0
        ? Number((team.reduce((sum, member) => sum + member.utilization, 0) / team.length).toFixed(1))
        : 0;

    return res.json({
      metrics: {
        activeWorkforce: team.length,
        avgUtilization: averageUtilization,
        openPositions: 5,
        safetyCertifiedRate: 96
      },
      team
    });
  }
);

export default router;
