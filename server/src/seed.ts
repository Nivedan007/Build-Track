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
