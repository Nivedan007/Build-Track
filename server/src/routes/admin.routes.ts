import { Router } from "express";
import { prisma } from "../config/prisma";
import { requireAuth, requireRoles, AuthRequest } from "../middleware/auth";

const router = Router();

// Protected route: only accessible by ADMIN users
router.get("/admin-id", requireAuth, requireRoles("ADMIN"), async (req: AuthRequest, res) => {
  try {
    // Find the admin user
    const admin = await prisma.user.findFirst({ where: { role: "ADMIN" }, select: { id: true, email: true } });
    if (!admin) {
      return res.status(404).json({ message: "Admin user not found" });
    }

    return res.json({ adminId: admin.id, email: admin.email });
  } catch (error) {
    console.error("Admin ID error:", error);
    return res.status(500).json({ message: "Failed to fetch admin id" });
  }
});

export default router;
