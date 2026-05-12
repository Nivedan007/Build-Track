import { Router } from "express";
import { prisma } from "../config/prisma";
import { requireAuth, AuthRequest } from "../middleware/auth";

const router = Router();

function normalize(text: string) {
  return text.toLowerCase().trim();
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(value);
}

router.post("/chat", requireAuth, async (req: AuthRequest, res) => {
  const message = String(req.body?.message || "").trim();
  const role = req.user?.role || "";

  if (!message) {
    return res.status(400).json({ message: "Message is required" });
  }

  const [projects, tasks, users] = await Promise.all([
    prisma.project.findMany({
      include: { engineer: { select: { name: true } } },
      orderBy: { updatedAt: "desc" }
    }),
    prisma.task.findMany({
      include: { project: { select: { title: true } }, assignee: { select: { name: true } } },
      orderBy: { updatedAt: "desc" }
    }),
    prisma.user.findMany({ select: { id: true, name: true, role: true } })
  ]);

  const delayedProjects = projects.filter((project) => project.status === "DELAYED");
  const delayedTasks = tasks.filter((task) => task.status === "DELAYED");
  const activeProjects = projects.filter((project) => project.status === "IN_PROGRESS");
  const totalBudget = projects.reduce((sum, project) => sum + project.budget, 0);
  const avgProgress = projects.length
    ? Math.round(projects.reduce((sum, project) => sum + project.progressPercentage, 0) / projects.length)
    : 0;

  const input = normalize(message);
  let answer = "";
  let followUp = "";

  if (/(hello|hi|hey|good morning|good evening)/.test(input)) {
    answer = `Hello ${req.user?.email?.split("@")[0] || "there"}. I’m your BuildTrack AI assistant. I can summarize projects, tasks, reports, team load, and risk signals.`;
    followUp = "Try asking: 'Which projects are delayed?' or 'Give me a summary of current site risk.'";
  } else if (/(project|projects|portfolio)/.test(input) && /(delay|delayed|risk|at risk|problem)/.test(input)) {
    if (!delayedProjects.length) {
      answer = "No projects are currently marked delayed. The portfolio is stable right now.";
    } else {
      answer = `There are ${delayedProjects.length} delayed projects. The most urgent ones are ${delayedProjects
        .slice(0, 3)
        .map((project) => `${project.title} (${project.location})`)
        .join(", ")}.`;
      followUp = "I can also break this down by owner, budget, or location.";
    }
  } else if (/(task|tasks|work items|worklist)/.test(input)) {
    const pendingCount = tasks.filter((task) => task.status === "PENDING").length;
    const completedCount = tasks.filter((task) => task.status === "COMPLETED").length;
    answer = `You currently have ${tasks.length} tasks total: ${pendingCount} pending, ${completedCount} completed, and ${delayedTasks.length} delayed.`;
    if (delayedTasks.length) {
      followUp = `The most urgent task is ${delayedTasks[0].title} in ${delayedTasks[0].project.title}.`;
    }
  } else if (/(budget|cost|spend|finance)/.test(input)) {
    answer = `Current portfolio budget is Rs. ${formatCurrency(totalBudget)} across ${projects.length} projects. Average progress is ${avgProgress}%.`;
    followUp = "If you want, I can highlight the most expensive project or the highest-risk site.";
  } else if (/(team|workforce|staff|crew|engineer|worker)/.test(input)) {
    const engineers = users.filter((user) => user.role === "SITE_ENGINEER").length;
    const workers = users.filter((user) => user.role === "WORKER").length;
    const managers = users.filter((user) => user.role === "PROJECT_MANAGER").length;
    answer = `Team snapshot: ${managers} project managers, ${engineers} site engineers, and ${workers} workers in the system.`;
    followUp = "Ask me for workforce load, training readiness, or assignment summaries.";
  } else if (/(report|reports|analytics|dashboard)/.test(input)) {
    answer = `Dashboard summary: ${projects.length} projects, ${activeProjects.length} active, ${delayedProjects.length} delayed, average progress ${avgProgress}%.`;
    followUp = "I can also generate a quick executive summary for your next meeting.";
  } else if (/(ai analyst|risk|delay prediction|forecast)/.test(input)) {
    answer = "Use the AI Analyst page to generate a delay probability from weather, attendance, material shortages, and current progress. I can also explain what the result means.";
    followUp = "Open AI Analyst from the navigation to run a forecast.";
  } else if (/(login|password|auth|access|role)/.test(input)) {
    answer = `Authentication is role-based. Available roles are ADMIN, PROJECT_MANAGER, SITE_ENGINEER, CLIENT, and WORKER. If you’re signed in, I can help with data relevant to your access level.`;
  } else if (/(thanks|thank you|great|cool|nice)/.test(input)) {
    answer = "You’re welcome. I’m here whenever you need a quick operational summary.";
  } else {
    answer = "I can help with project status, task load, team utilization, reports, AI forecasts, and access questions. Try a short command like 'show delayed projects' or 'team summary'.";
    followUp = "For deeper analysis, ask about a specific project, task type, or report.";
  }

  return res.json({
    answer,
    followUp,
    context: {
      projectCount: projects.length,
      delayedProjects: delayedProjects.length,
      delayedTasks: delayedTasks.length,
      avgProgress,
      totalBudget: formatCurrency(totalBudget),
      role
    }
  });
});

export default router;
