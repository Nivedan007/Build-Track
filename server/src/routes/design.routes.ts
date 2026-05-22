import express from "express";
import { prisma } from "../config/prisma";

const router = express.Router();

// List designs (paginated simple)
router.get("/", async (req, res, next) => {
  try {
    const designs = await prisma.design.findMany({ orderBy: { createdAt: "desc" }, take: 50 });
    res.json(designs);
  } catch (err) {
    next(err);
  }
});

// Get a design
router.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const design = await prisma.design.findUnique({ where: { id } });
    if (!design) return res.status(404).json({ message: "Design not found" });
    res.json(design);
  } catch (err) {
    next(err);
  }
});

// Create a design
router.post("/", async (req, res, next) => {
  try {
    const { name, data, ownerId } = req.body;
    const created = await prisma.design.create({ data: { name: name || "Untitled Design", data, ownerId } });
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
});

// Update a design
router.put("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, data } = req.body;
    const updated = await prisma.design.update({ where: { id }, data: { name, data } });
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

// Delete a design
router.delete("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.design.delete({ where: { id } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default router;
