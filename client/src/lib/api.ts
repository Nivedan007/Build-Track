import axios from "axios";
import { useAuthStore } from "@/lib/store";
import { demoProjects, demoTasks } from "@/lib/mock";

const API_URL = process.env.NEXT_PUBLIC_API_URL?.trim().replace(/\/$/, "") ?? "";
const DEMO_TOKEN = process.env.NEXT_PUBLIC_DEMO_TOKEN || "demo-admin-token";

type AxiosLikeResponse<T> = Promise<{ data: T }>;

function makeResponse<T>(data: T): AxiosLikeResponse<T> {
  return Promise.resolve({ data });
}

function toTaskPayload() {
  return demoTasks.map((task, index) => ({
    id: task.id,
    title: task.title,
    priority: task.priority,
    status: task.status,
    dueDate: task.dueDate,
    assignee: { name: task.assignedTo || `Assignee ${index + 1}` }
  }));
}

function toTeamPayload() {
  return {
    team: [
      { id: "cmp-team-1", name: "Arun Engineer", role: "SITE_ENGINEER", location: "Chennai", utilization: 86, status: "On Site" },
      { id: "cmp-team-2", name: "Mira Safety", role: "SITE_ENGINEER", location: "Bengaluru", utilization: 78, status: "On Site" },
      { id: "cmp-team-3", name: "Rahul PM", role: "PROJECT_MANAGER", location: "Remote", utilization: 69, status: "Hybrid" }
    ],
    metrics: {
      activeWorkforce: 187,
      safetyCertifiedRate: 93,
      openPositions: 2,
      avgUtilization: 78
    }
  };
}

function toReportsPayload() {
  return {
    reports: [
      { name: "Weekly Delivery Summary", owner: "Rahul PM", updated: new Date().toISOString(), status: "Ready" },
      { name: "Safety Compliance Digest", owner: "Mira Safety", updated: new Date().toISOString(), status: "Ready" },
      { name: "Procurement Risk Board", owner: "Arun Engineer", updated: new Date().toISOString(), status: "In Review" }
    ],
    metrics: {
      reportCoverage: 92,
      forecastAccuracy: 88,
      dueSoonTasks: demoTasks.filter((task) => task.status !== "COMPLETED").length
    }
  };
}

function toPredictionPayload(input: Record<string, number>) {
  const riskScore = Math.min(1, Math.max(0, (input.weatherRisk ?? 0) * 0.35 + (input.materialShortages ?? 0) * 0.08 + (input.pastDelays ?? 0) * 0.05 + (1 - (input.attendanceRate ?? 1)) * 0.5 + (1 - (input.currentProgress ?? 0) / 100) * 0.25));
  const riskBand = riskScore > 0.62 ? "HIGH" : riskScore > 0.35 ? "MEDIUM" : "LOW";
  const completion = new Date();
  completion.setDate(completion.getDate() + (riskBand === "HIGH" ? 28 : riskBand === "MEDIUM" ? 18 : 7));

  return {
    delayProbability: Number(riskScore.toFixed(2)),
    estimatedCompletionDate: completion.toISOString(),
    riskBand
  };
}

function toAssistantPayload(message: string) {
  const lower = message.toLowerCase();
  if (lower.includes("delay") || lower.includes("risk")) {
    return { answer: "Two projects need attention. Procurement delays and weather risk are the main drivers. Recommend escalation and schedule resequencing.", followUp: "Do you want the high-risk projects list next?" };
  }

  if (lower.includes("team")) {
    return { answer: "Workforce utilization is balanced overall. Site engineers are near target, and safety certification remains above threshold.", followUp: "I can show the team overview next." };
  }

  if (lower.includes("budget")) {
    return { answer: "Budget utilization is within target, with the biggest pressure coming from procurement and rework exposure.", followUp: "Want a project-level budget summary?" };
  }

  return { answer: "I can help with projects, tasks, reports, team load, login roles, or AI forecasts.", followUp: "Try asking about delayed projects or team utilization." };
}

function toLoginPayload(email: string, password: string) {
  if (email.toLowerCase() !== "admin@buildtrack.ai" || password !== "BuildTrack@123") {
    const error = new Error("Invalid email or password");
    // @ts-expect-error - attach response data for callers that inspect axios-style errors
    error.response = { status: 401, data: { message: "Invalid email or password" } };
    throw error;
  }

  return {
    message: "Login successful",
    token: DEMO_TOKEN,
    user: { id: "cmp-admin-demo", name: "Admin", email: "admin@buildtrack.ai", role: "ADMIN" }
  };
}

async function demoGet(path: string) {
  if (path === "/projects") return makeResponse({ projects: demoProjects });
  if (path === "/tasks") return makeResponse({ tasks: toTaskPayload() });
  if (path === "/reports/summary") return makeResponse(toReportsPayload());
  if (path === "/team/overview") return makeResponse(toTeamPayload());
  if (path === "/auth/profile") return makeResponse({ user: { id: "cmp-admin-demo", name: "Admin", email: "admin@buildtrack.ai", role: "ADMIN" } });
  return makeResponse({});
}

async function demoPost(path: string, payload: any) {
  if (path === "/auth/login") return makeResponse(toLoginPayload(payload?.email ?? "", payload?.password ?? ""));
  if (path === "/ai/predict-delay") return makeResponse(toPredictionPayload(payload ?? {}));
  if (path === "/assistant/chat") return makeResponse(toAssistantPayload(String(payload?.message ?? "")));
  if (path === "/uploads/task-proof") return makeResponse({ url: `demo://proof/${Date.now()}` });
  return makeResponse({});
}

export const api = axios.create({
  baseURL: "/api"
});

export const hasConfiguredApiUrl = Boolean(API_URL);
export const configuredApiUrl = API_URL || "http://localhost:5001";
export const isDemoMode = !hasConfiguredApiUrl;

const realGet = api.get.bind(api);
const realPost = api.post.bind(api);

api.get = (async (path: string, config?: any) => {
  if (isDemoMode) return demoGet(path);
  return realGet(path, config);
}) as typeof api.get;

api.post = (async (path: string, payload?: any, config?: any) => {
  if (isDemoMode) return demoPost(path, payload);
  return realPost(path, payload, config);
}) as typeof api.post;

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
