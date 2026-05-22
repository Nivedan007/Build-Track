import axios from "axios";
import { useAuthStore } from "@/lib/store";
import { demoProjects, demoTasks } from "@/lib/mock";

const API_URL = process.env.NEXT_PUBLIC_API_URL?.trim().replace(/\/$/, "") ?? "";
const DEMO_TOKEN = process.env.NEXT_PUBLIC_DEMO_TOKEN?.trim() || "demo-admin-token";

type ApiResponse<T> = Promise<{ data: T }>;

type LoginPayload = { email?: string; password?: string };
type ForecastPayload = {
  weatherRisk?: number;
  pastDelays?: number;
  attendanceRate?: number;
  materialShortages?: number;
  currentProgress?: number;
};

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const createAxiosError = (status: number, message: string) => ({
  response: {
    status,
    data: { message }
  }
});

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const buildForecast = (payload: ForecastPayload) => {
  const weatherRisk = payload.weatherRisk ?? 0;
  const pastDelays = payload.pastDelays ?? 0;
  const attendanceRate = payload.attendanceRate ?? 1;
  const materialShortages = payload.materialShortages ?? 0;
  const currentProgress = payload.currentProgress ?? 0;

  const delayProbability = clamp(
    0.08 + weatherRisk * 0.28 + pastDelays * 0.05 + (1 - attendanceRate) * 0.35 + materialShortages * 0.04 + (1 - currentProgress / 100) * 0.12,
    0.04,
    0.95
  );

  const riskBand = delayProbability >= 0.65 ? "HIGH" : delayProbability >= 0.35 ? "MEDIUM" : "LOW";
  const dateOffsetDays = riskBand === "HIGH" ? 21 : riskBand === "MEDIUM" ? 12 : 6;
  const estimatedCompletionDate = new Date(Date.now() + dateOffsetDays * 24 * 60 * 60 * 1000).toISOString();

  return { delayProbability, estimatedCompletionDate, riskBand } as const;
};

const buildAssistantAnswer = (message: string) => {
  const text = message.toLowerCase();

  if (text.includes("delayed")) {
    return {
      answer: `Demo mode: ${demoProjects.filter((project) => project.status === "DELAYED").length} project is delayed. Highest risk: ${demoProjects[1].title}.`,
      followUp: "Open Reports to inspect the delay trend."
    };
  }

  if (text.includes("team load") || text.includes("workload")) {
    return {
      answer: `Demo mode: workforce load is balanced. Sample tasks are assigned across ${demoTasks.length} active items.`,
      followUp: "Check Team for role distribution."
    };
  }

  if (text.includes("budget")) {
    return {
      answer: "Demo mode: budget utilization is tracking inside target range for the active projects.",
      followUp: "Review the dashboard metrics for cost control."
    };
  }

  if (text.includes("ai analyst") || text.includes("forecast")) {
    return {
      answer: "Demo mode: AI Analyst can estimate delay risk, highlight high-risk projects, and recommend intervention steps.",
      followUp: "Try the AI Analyst page for a sample forecast."
    };
  }

  return {
    answer: "Demo mode: I can summarize projects, tasks, reports, team load, and forecast risk without a live backend.",
    followUp: "Ask about delayed projects, budget status, or AI forecasts."
  };
};

const buildUploadUrl = (formData: FormData) => {
  const proof = formData.get("proof");
  const fileName = proof instanceof File ? proof.name : "proof-upload";
  return `demo://uploads/${encodeURIComponent(fileName)}`;
};

const axiosApi = axios.create({
  baseURL: "/api"
});

axiosApi.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const hasConfiguredApiUrl = Boolean(API_URL);
export const configuredApiUrl = API_URL || "http://localhost:5001";
export const isDemoMode = !hasConfiguredApiUrl;

const mockApi = {
  get: async (path: string): ApiResponse<any> => {
    await delay(120);

    switch (path) {
      case "/projects":
        return { data: { projects: demoProjects } };

      default:
        throw createAxiosError(404, `Demo mode does not implement ${path}`);
    }
  },
  post: async (path: string, payload?: any, config?: any): ApiResponse<any> => {
    await delay(180);

    switch (path) {
      case "/auth/login": {
        const body = (payload || {}) as LoginPayload;
        const email = (body.email || "").trim().toLowerCase();
        const password = body.password || "";

        if (email === "admin@buildtrack.ai" && password === "BuildTrack@123") {
          return {
            data: {
              message: "Login successful",
              token: DEMO_TOKEN,
              user: {
                id: "demo-admin",
                name: "Admin",
                email: "admin@buildtrack.ai",
                role: "ADMIN"
              }
            }
          };
        }

        throw createAxiosError(401, "Invalid email or password");
      }

      case "/ai/predict-delay": {
        return { data: buildForecast(payload || {}) };
      }

      case "/assistant/chat": {
        const message = typeof payload?.message === "string" ? payload.message : "";
        return { data: buildAssistantAnswer(message) };
      }

      case "/uploads/task-proof": {
        const formData = payload as FormData;
        if (typeof FormData !== "undefined" && formData instanceof FormData) {
          const progressCallback = config?.onUploadProgress;
          progressCallback?.({ loaded: 1, total: 1 } as any);
          return { data: { url: buildUploadUrl(formData) } };
        }

        return { data: { url: "demo://uploads/proof-upload" } };
      }

      default:
        throw createAxiosError(404, `Demo mode does not implement ${path}`);
    }
  }
};

export const api = hasConfiguredApiUrl ? axiosApi : mockApi;
