import { prisma } from "./config/prisma";
import bcrypt from "bcryptjs";
import { signToken } from "./utils/jwt";

async function main() {
  console.log("Seeding database...");

  const adminEmail = "admin@buildtrack.ai";
  const existing = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!existing) {
    const hash = await bcrypt.hash("BuildTrack@123", 10);
    const admin = await prisma.user.create({
      data: {
        name: "Admin",
        email: adminEmail,
        password: hash,
        role: "ADMIN"
      }
    });

    console.log("Created admin:", admin.email);
    console.log("Admin ID:", admin.id);
    const token = signToken({ userId: admin.id, role: admin.role, email: admin.email });
    console.log("Demo admin token (use in client .env):", token);
  } else {
    console.log("Admin user already exists.");
    const token = signToken({ userId: existing.id, role: existing.role, email: existing.email });
    console.log("Existing admin token (use in client .env):", token);
  }

  const people = [
    { name: "Rahul PM", email: "rahul.pm@buildtrack.ai", role: "PROJECT_MANAGER" as const },
    { name: "Arun Engineer", email: "arun.eng@buildtrack.ai", role: "SITE_ENGINEER" as const },
    { name: "Mira Safety", email: "mira.safety@buildtrack.ai", role: "SITE_ENGINEER" as const },
    { name: "Worker Team 4", email: "worker4@buildtrack.ai", role: "WORKER" as const }
  ];

  for (const person of people) {
    const exists = await prisma.user.findUnique({ where: { email: person.email } });
    if (!exists) {
      const hash = await bcrypt.hash("BuildTrack@123", 10);
      const created = await prisma.user.create({
        data: {
          name: person.name,
          email: person.email,
          password: hash,
          role: person.role
        }
      });
      console.log(`Created user: ${person.email} - ID: ${created.id}`);
    }
  }

  // create sample projects
  const projects = await prisma.project.findMany();
  if (projects.length === 0) {
    const arun = await prisma.user.findUnique({ where: { email: "arun.eng@buildtrack.ai" } });
    const mira = await prisma.user.findUnique({ where: { email: "mira.safety@buildtrack.ai" } });
    const worker4 = await prisma.user.findUnique({ where: { email: "worker4@buildtrack.ai" } });

    const p1 = await prisma.project.create({
      data: {
        title: "Skyline Towers Phase A",
        clientName: "Nova Infra",
        budget: 12000000,
        deadline: new Date("2026-12-15"),
        location: "Chennai",
        progressPercentage: 72,
        status: "IN_PROGRESS",
        engineerId: arun?.id
      }
    });

    const p2 = await prisma.project.create({
      data: {
        title: "Metro Link Station Block",
        clientName: "Urban Rail Corp",
        budget: 8000000,
        deadline: new Date("2026-09-20"),
        location: "Bengaluru",
        progressPercentage: 44,
        status: "DELAYED",
        engineerId: mira?.id
      }
    });

    await prisma.task.createMany({
      data: [
        {
          title: "Foundation concrete quality audit",
          projectId: p1.id,
          dueDate: new Date("2026-05-15"),
          priority: "HIGH",
          assignedTo: arun?.id
        },
        {
          title: "Electrical duct alignment",
          projectId: p1.id,
          dueDate: new Date("2026-05-18"),
          priority: "MEDIUM",
          assignedTo: worker4?.id
        },
        {
          title: "Exterior scaffold compliance check",
          projectId: p2.id,
          dueDate: new Date("2026-05-11"),
          priority: "HIGH",
          status: "DELAYED",
          assignedTo: mira?.id
        }
      ]
    });

    console.log("Sample projects and tasks created.");
  } else {
    console.log("Projects already exist, skipping sample creation.");

    const arun = await prisma.user.findUnique({ where: { email: "arun.eng@buildtrack.ai" } });
    const mira = await prisma.user.findUnique({ where: { email: "mira.safety@buildtrack.ai" } });
    const worker4 = await prisma.user.findUnique({ where: { email: "worker4@buildtrack.ai" } });

    const existingProjects = await prisma.project.findMany({ orderBy: { createdAt: "asc" } });
    if (existingProjects[0] && !existingProjects[0].engineerId) {
      await prisma.project.update({ where: { id: existingProjects[0].id }, data: { engineerId: arun?.id } });
    }
    if (existingProjects[1] && !existingProjects[1].engineerId) {
      await prisma.project.update({ where: { id: existingProjects[1].id }, data: { engineerId: mira?.id } });
    }

    const existingTasks = await prisma.task.findMany({ orderBy: { createdAt: "asc" } });
    if (existingTasks[0] && !existingTasks[0].assignedTo) {
      await prisma.task.update({ where: { id: existingTasks[0].id }, data: { assignedTo: arun?.id } });
    }
    if (existingTasks[1] && !existingTasks[1].assignedTo) {
      await prisma.task.update({ where: { id: existingTasks[1].id }, data: { assignedTo: worker4?.id } });
    }
    if (existingTasks[2] && !existingTasks[2].assignedTo) {
      await prisma.task.update({ where: { id: existingTasks[2].id }, data: { assignedTo: mira?.id } });
    }

    console.log("Backfilled project/task assignments for team analytics.");
    // Log summary of key user ids for convenience
    const allUsers = await prisma.user.findMany({ select: { id: true, email: true, role: true } });
    console.log("User summary:");
    allUsers.forEach((u) => console.log(`- ${u.email} (${u.role}): ${u.id}`));
  }

  // Seed sample floor plan designs if none exist
  const designCount = await prisma.design.count();
  if (designCount === 0) {
    console.log("Seeding sample architectural designs...");
    const sampleRes = {
      walls: [
        { id: "wall-ext-1", x: 0, z: -5, width: 12, depth: 0.2, height: 3, rotationY: 0, color: "#cbd5e1" },
        { id: "wall-ext-2", x: 6, z: 0, width: 10, depth: 0.2, height: 3, rotationY: 1.5707963267948966, color: "#cbd5e1" },
        { id: "wall-ext-3", x: 0, z: 5, width: 12, depth: 0.2, height: 3, rotationY: 0, color: "#cbd5e1" },
        { id: "wall-ext-4", x: -6, z: 0, width: 10, depth: 0.2, height: 3, rotationY: 1.5707963267948966, color: "#cbd5e1" },
        { id: "wall-int-bed1-v", x: -2, z: -3, width: 4, depth: 0.15, height: 3, rotationY: 1.5707963267948966, color: "#94a3b8" },
        { id: "wall-int-bed1-h", x: -4, z: -1, width: 4, depth: 0.15, height: 3, rotationY: 0, color: "#94a3b8" },
        { id: "wall-int-kitchen-v", x: 2, z: -3, width: 4, depth: 0.15, height: 3, rotationY: 1.5707963267948966, color: "#94a3b8" },
        { id: "wall-int-kitchen-h", x: 4, z: -1, width: 4, depth: 0.15, height: 3, rotationY: 0, color: "#94a3b8" },
        { id: "wall-int-bath-v", x: 0, z: 2.5, width: 5, depth: 0.15, height: 3, rotationY: 1.5707963267948966, color: "#94a3b8" }
      ],
      openings: [
        { id: "op-door-main", wallId: "wall-ext-3", kind: "door", offset: 1.5, width: 1.0, height: 2.2, sillHeight: 0 },
        { id: "op-door-bed1", wallId: "wall-int-bed1-h", kind: "door", offset: 0.8, width: 0.9, height: 2.1, sillHeight: 0 },
        { id: "op-door-kitchen", wallId: "wall-int-kitchen-h", kind: "door", offset: -0.8, width: 0.9, height: 2.1, sillHeight: 0 },
        { id: "op-door-bath", wallId: "wall-int-bath-v", kind: "door", offset: 0.5, width: 0.8, height: 2.1, sillHeight: 0 },
        { id: "op-win-bed1", wallId: "wall-ext-4", kind: "window", offset: -2.0, width: 1.5, height: 1.5, sillHeight: 0.8 },
        { id: "op-win-kitchen", wallId: "wall-ext-2", kind: "window", offset: -2.0, width: 1.2, height: 1.2, sillHeight: 1.0 },
        { id: "op-win-living", wallId: "wall-ext-1", kind: "window", offset: 2.0, width: 2.0, height: 1.5, sillHeight: 0.8 }
      ],
      camera: { mode: "orthographic", preset: "iso" }
    };

    const sampleOff = {
      walls: [
        { id: "off-ext-1", x: 0, z: -6, width: 16, depth: 0.2, height: 3.2, rotationY: 0, color: "#cbd5e1" },
        { id: "off-ext-2", x: 8, z: 0, width: 12, depth: 0.2, height: 3.2, rotationY: 1.5707963267948966, color: "#cbd5e1" },
        { id: "off-ext-3", x: 0, z: 6, width: 16, depth: 0.2, height: 3.2, rotationY: 0, color: "#cbd5e1" },
        { id: "off-ext-4", x: -8, z: 0, width: 12, depth: 0.2, height: 3.2, rotationY: 1.5707963267948966, color: "#cbd5e1" },
        { id: "off-int-exec1-v", x: -4, z: -2, width: 8, depth: 0.15, height: 3.2, rotationY: 1.5707963267948966, color: "#a1a1aa" },
        { id: "off-int-exec1-h", x: -6, z: 2, width: 4, depth: 0.15, height: 3.2, rotationY: 0, color: "#a1a1aa" },
        { id: "off-int-exec2-h", x: -2, z: 2, width: 4, depth: 0.15, height: 3.2, rotationY: 0, color: "#a1a1aa" },
        { id: "off-int-conf-v", x: 3, z: 0, width: 12, depth: 0.15, height: 3.2, rotationY: 1.5707963267948966, color: "#a1a1aa" }
      ],
      openings: [
        { id: "off-door-main", wallId: "off-ext-3", kind: "door", offset: 0, width: 1.6, height: 2.4, sillHeight: 0 },
        { id: "off-door-exec1", wallId: "off-int-exec1-h", kind: "door", offset: 1.0, width: 0.9, height: 2.1, sillHeight: 0 },
        { id: "off-door-exec2", wallId: "off-int-exec2-h", kind: "door", offset: -1.0, width: 0.9, height: 2.1, sillHeight: 0 },
        { id: "off-door-conf", wallId: "off-int-conf-v", kind: "door", offset: 2.0, width: 1.0, height: 2.2, sillHeight: 0 },
        { id: "off-win-exec1", wallId: "off-ext-4", kind: "window", offset: -2.5, width: 2.2, height: 1.8, sillHeight: 0.7 },
        { id: "off-win-exec2", wallId: "off-ext-4", kind: "window", offset: 2.5, width: 2.2, height: 1.8, sillHeight: 0.7 },
        { id: "off-win-conf", wallId: "off-ext-2", kind: "window", offset: 0, width: 4.0, height: 2.0, sillHeight: 0.6 }
      ],
      camera: { mode: "perspective", preset: "iso" }
    };

    await prisma.design.create({
      data: {
        name: "Luxury 2BHK Residential Floor Plan",
        data: sampleRes
      }
    });

    await prisma.design.create({
      data: {
        name: "Commercial Office Executive Layout",
        data: sampleOff
      }
    });

    console.log("Architectural designs seeded successfully.");
  }

  console.log("Seeding complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
