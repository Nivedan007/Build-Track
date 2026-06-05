import axios from "axios";
import { useAuthStore } from "@/lib/store";
import { demoProjects, demoTasks } from "@/lib/mock";
import { DesignRecord } from "@/lib/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL?.trim().replace(/\/$/, "") ?? "";
const DEMO_TOKEN = process.env.NEXT_PUBLIC_DEMO_TOKEN?.trim() || "demo-admin-token";
const DESIGN_STORAGE_KEY = "buildtrack:designs";

type ApiResponse<T> = Promise<{ data: T }>;

type LoginPayload = { email?: string; password?: string };
type ForecastPayload = {
  weatherRisk?: number;
  pastDelays?: number;
  attendanceRate?: number;
  materialShortages?: number;
  currentProgress?: number;
};

type OptimizationPayload = {
  weatherRisk?: number;
  crewUtilization?: number;
  materialReadiness?: number;
  taskBacklog?: number;
  overtimeHours?: number;
  currentProgress?: number;
  skillMatch?: number;
};

type CostRiskPayload = {
  projectBudget?: number;
  durationDays?: number;
  taskCount?: number;
  highPriorityTaskCount?: number;
  averageAttendanceRate?: number;
  weatherRisk?: number;
  materialShortages?: number;
};

type SafetyRiskPayload = {
  workerCount?: number;
  overtimeHoursAverage?: number;
  safetyCertRate?: number;
  weatherSeverity?: number;
  scaffoldingActivity?: number;
  heavyMachineryCount?: number;
  lastSafetyAuditDays?: number;
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

const buildOptimization = (payload: OptimizationPayload) => {
  const weatherRisk = payload.weatherRisk ?? 0;
  const crewUtilization = payload.crewUtilization ?? 0.8;
  const materialReadiness = payload.materialReadiness ?? 0.8;
  const taskBacklog = payload.taskBacklog ?? 0;
  const overtimeHours = payload.overtimeHours ?? 0;
  const currentProgress = payload.currentProgress ?? 0;
  const skillMatch = payload.skillMatch ?? 0.8;

  const efficiencyScore = Math.max(
    0,
    Math.min(
      100,
      32 * crewUtilization +
        22 * materialReadiness +
        16 * skillMatch +
        14 * (1 - weatherRisk) +
        10 * (1 - Math.min(taskBacklog, 25) / 25) +
        6 * (1 - Math.min(overtimeHours, 24) / 24) +
        4 * (currentProgress / 100)
    )
  );

  const actions = [
    materialReadiness < 0.7 ? "Lock supplier deliveries for critical materials" : "Maintain current supply cadence",
    crewUtilization < 0.75 ? "Rebalance site crew assignments to reduce idle time" : "Keep crew allocation steady",
    taskBacklog > 10 ? "Split backlog into smaller work packets and prioritize blockers" : "Backlog is manageable",
    weatherRisk > 0.55 ? "Move weather-sensitive tasks earlier in the shift" : "Weather risk is acceptable",
    overtimeHours > 8 ? "Cap overtime and shift to better-rested crews" : "Overtime is within range"
  ].filter(Boolean);

  return {
    efficiencyScore: Number(efficiencyScore.toFixed(2)),
    efficiencyBand: efficiencyScore >= 80 ? "HIGH" : efficiencyScore >= 60 ? "MEDIUM" : "LOW",
    recommendedCrewSize: Math.max(2, Math.round(4 + taskBacklog / 8 + weatherRisk * 2)),
    recommendedOvertimeHours: Math.max(0, Math.min(12, Math.round((100 - efficiencyScore) / 14))),
    expectedProductivityGain: Number(Math.min(18, Math.max(0, (100 - efficiencyScore) * 0.18)).toFixed(2)),
    priorityActions: actions.slice(0, 5),
    bottlenecks: [
      { label: "Materials", risk: Number(((1 - materialReadiness) * 100).toFixed(2)) },
      { label: "Crew", risk: Number(((1 - crewUtilization) * 100).toFixed(2)) },
      { label: "Weather", risk: Number((weatherRisk * 100).toFixed(2)) }
    ]
  };
};

const buildCostRisk = (payload: CostRiskPayload) => {
  const projectBudget = payload.projectBudget ?? 500000;
  const durationDays = payload.durationDays ?? 90;
  const taskCount = payload.taskCount ?? 20;
  const highPriorityTaskCount = payload.highPriorityTaskCount ?? 2;
  const averageAttendanceRate = payload.averageAttendanceRate ?? 0.9;
  const weatherRisk = payload.weatherRisk ?? 0.2;
  const materialShortages = payload.materialShortages ?? 1;

  const priorityRatio = highPriorityTaskCount / Math.max(1, taskCount);
  const overrunProb = clamp(
    0.15 * (1 - averageAttendanceRate) +
      0.20 * weatherRisk +
      0.25 * (materialShortages / 10) +
      0.20 * priorityRatio +
      0.10 * (Math.min(durationDays, 180) / 180) +
      0.10 * (1 - Math.min(projectBudget, 1000000) / 1000000),
    0.05,
    0.95
  );

  const riskBand = overrunProb >= 0.6 ? "HIGH" : overrunProb >= 0.3 ? "MEDIUM" : "LOW";
  const expectedOverrunPct = Number((overrunProb * 35.0).toFixed(2));
  
  const actions = [
    materialShortages > 3 ? "Audit vendor supply chains and source alternative suppliers" : "",
    averageAttendanceRate < 0.75 ? "Implement automated attendance tracking and daily labor incentives" : "",
    weatherRisk > 0.6 ? "Schedule weather-contingent buffer periods in the project plan" : "",
    priorityRatio > 0.2 ? "De-escalate non-critical tasks to reallocate budget to key blockers" : ""
  ].filter(Boolean);

  if (actions.length === 0) {
    actions.push("Maintain existing cost control monitors and audit bi-weekly");
  }

  return {
    costOverrunProbability: overrunProb,
    expectedOverrunPercent: expectedOverrunPct,
    riskBand,
    mitigationActions: actions.slice(0, 4)
  };
};

const buildSafetyRisk = (payload: SafetyRiskPayload) => {
  const workerCount = payload.workerCount ?? 150;
  const overtimeHoursAverage = payload.overtimeHoursAverage ?? 3.5;
  const safetyCertRate = payload.safetyCertRate ?? 0.85;
  const weatherSeverity = payload.weatherSeverity ?? 0.25;
  const scaffoldingActivity = payload.scaffoldingActivity ?? 0.0;
  const heavyMachineryCount = payload.heavyMachineryCount ?? 2;
  const lastSafetyAuditDays = payload.lastSafetyAuditDays ?? 5;

  const safetyProb = clamp(
    0.20 * (workerCount / 300) +
      0.18 * (overtimeHoursAverage / 12) +
      0.22 * (1 - safetyCertRate) +
      0.15 * weatherSeverity +
      0.12 * scaffoldingActivity +
      0.08 * (heavyMachineryCount / 10) +
      0.05 * (lastSafetyAuditDays / 30),
    0.02,
    0.98
  );

  const riskBand = safetyProb >= 0.45 ? "HIGH" : safetyProb >= 0.20 ? "MEDIUM" : "LOW";

  const recommendations = [];
  if (safetyCertRate < 0.8) {
    recommendations.push("Mandate emergency safety refresher briefing for uncertified workers");
  }
  if (overtimeHoursAverage > 6.0) {
    recommendations.push("Enforce shift duration caps and fatigue management rest breaks");
  }
  if (weatherSeverity > 0.6) {
    recommendations.push("Suspend outdoor heavy lifts and high-altitude scaffolding activities");
  }
  if (scaffoldingActivity > 0.5 && safetyCertRate < 0.9) {
    recommendations.push("Double-check all fall-arrest harnesses and scaffold certifications");
  }
  if (lastSafetyAuditDays > 14) {
    recommendations.push("Conduct a site-wide safety walkabout immediately (audit overdue)");
  }
  if (heavyMachineryCount > 5) {
    recommendations.push("Establish dedicated exclusion zones and spotters for heavy plant operations");
  }

  if (recommendations.length === 0) {
    recommendations.push("Continue regular safety audits and standard tool-box talks");
  }

  return {
    safetyIncidentProbability: safetyProb,
    riskBand,
    preventativeRecommendations: recommendations.slice(0, 4)
  };
};

const buildEquipmentFailure = (payload: any) => {
  const operatingHours = payload.operatingHours ?? 0;
  const vibrationLevel = payload.vibrationLevel ?? 0;
  const oilQuality = payload.oilQuality ?? 0.5;
  const engineTemperature = payload.engineTemperature ?? 70;
  const equipmentAge = payload.equipmentAge ?? 3;
  const daysSinceLastMaintenance = payload.daysSinceLastMaintenance ?? 30;
  const overloadEvents = payload.overloadEvents ?? 0;

  // Simple heuristic prediction modeling
  let prob = 0.05;
  prob += (operatingHours / 10000) * 0.15;
  prob += (vibrationLevel / 15) * 0.25;
  prob += oilQuality * 0.20;
  prob += ((engineTemperature - 50) / 75) * 0.20;
  prob += (equipmentAge / 15) * 0.10;
  prob += (daysSinceLastMaintenance / 180) * 0.15;
  prob += (overloadEvents / 20) * 0.15;

  const failureProbability = clamp(prob, 0.01, 0.99);
  const riskBand = failureProbability > 0.65 ? "HIGH" : failureProbability > 0.30 ? "MEDIUM" : "LOW";

  let criticalComponent = "None";
  let recommendedAction = "CONTINUE OPERATION: All diagnostic metrics within acceptable tolerances. Maintain standard daily inspection log.";

  if (riskBand === "HIGH") {
    if (vibrationLevel > 8.0) {
      criticalComponent = "Hydraulics & Bearings";
      recommendedAction = "HALT OPERATION: Extreme vibration detected. Inspect bearings and hydraulic pistons immediately.";
    } else if (engineTemperature > 105.0) {
      criticalComponent = "Engine Cooling System";
      recommendedAction = "HALT OPERATION: Overheating danger. Inspect coolant levels, radiator fan, and engine oil.";
    } else {
      criticalComponent = "System Core";
      recommendedAction = "CRITICAL: Schedule emergency comprehensive mechanic teardown and testing.";
    }
  } else if (riskBand === "MEDIUM") {
    if (oilQuality > 0.75) {
      criticalComponent = "Lubrication Circuit";
      recommendedAction = "URGENT: Change oil filter, flush lines, and renew engine oil before next shift.";
    } else if (daysSinceLastMaintenance > 120) {
      criticalComponent = "Scheduled Maintenance";
      recommendedAction = "URGENT: General maintenance window is overdue. Schedule service within 48 operating hours.";
    } else if (overloadEvents > 8) {
      criticalComponent = "Structural joints";
      recommendedAction = "WARNING: Excessive stress cycles. Conduct ultrasonic crack check on structural joints.";
    } else {
      criticalComponent = "System Ancillaries";
      recommendedAction = "WARNING: Degraded performance. Schedule standard inspection within 3 operational days.";
    }
  }

  return {
    failureProbability: Number(failureProbability.toFixed(4)),
    riskBand,
    recommendedAction,
    criticalComponent
  };
};

export const getAssistantReply = (message: string) => {
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

const buildDemoTeamOverview = () => {
  const team = [
    {
      id: "tm-1",
      name: "Arun Kumar",
      role: "PROJECT_MANAGER",
      location: "Chennai",
      utilization: 84,
      status: "Active"
    },
    {
      id: "tm-2",
      name: "Mira Iyer",
      role: "SITE_ENGINEER",
      location: "Bengaluru",
      utilization: 76,
      status: "Active"
    },
    {
      id: "tm-3",
      name: "Suresh Patel",
      role: "SITE_ENGINEER",
      location: "Coimbatore",
      utilization: 69,
      status: "Active"
    },
    {
      id: "tm-4",
      name: "Deepa Rani",
      role: "WORKER",
      location: "Chennai",
      utilization: 58,
      status: "Available"
    }
  ];

  const avgUtilization = team.length
    ? Number((team.reduce((sum, member) => sum + member.utilization, 0) / team.length).toFixed(1))
    : 0;

  return {
    metrics: {
      activeWorkforce: team.length,
      safetyCertifiedRate: 96,
      openPositions: 2,
      avgUtilization
    },
    team
  };
};

const buildDemoReportsSummary = () => {
  const projectCount = demoProjects.length;
  const delayedProjects = demoProjects.filter((project) => project.status === "DELAYED").length;
  const completedProjects = demoProjects.filter((project) => project.status === "COMPLETED").length;
  const inProgressProjects = demoProjects.filter((project) => project.status === "IN_PROGRESS").length;
  const totalBudget = demoProjects.reduce((sum, project) => sum + project.budget, 0);
  const avgProgress = projectCount > 0
    ? Number((demoProjects.reduce((sum, project) => sum + project.progressPercentage, 0) / projectCount).toFixed(1))
    : 0;

  return {
    metrics: {
      projectCount,
      inProgressProjects,
      delayedProjects,
      completedProjects,
      totalBudget,
      avgProgress,
      taskCount: demoTasks.length,
      delayedTasks: demoTasks.filter((task) => task.status === "DELAYED").length,
      dueSoonTasks: demoTasks.length,
      forecastAccuracy: 88.6,
      reportCoverage: 94
    },
    reports: [
      { name: "Portfolio Health", owner: "Program Office", updated: new Date().toISOString(), status: "Ready" },
      { name: "Cost Variance Deep Dive", owner: "Finance Controls", updated: new Date().toISOString(), status: "In Review" },
      { name: "Safety Compliance Index", owner: "HSE", updated: new Date().toISOString(), status: "Ready" },
      { name: "Delay Risk Heatmap", owner: "AI Ops", updated: new Date().toISOString(), status: "Ready" }
    ]
  };
};

const buildUploadUrl = (formData: FormData) => {
  const proof = formData.get("proof");
  const fileName = proof instanceof File ? proof.name : "proof-upload";
  return `demo://uploads/${encodeURIComponent(fileName)}`;
};

const buildSampleDesign = (): DesignRecord => ({
  id: "sample-floor-plan",
  name: "Sample Floor Plan",
  createdAt: "2026-05-23T00:00:00.000Z",
  updatedAt: "2026-05-23T00:00:00.000Z",
  data: {
    walls: [
      { id: "w1", x: 0, z: 0, width: 8, depth: 0.2, height: 3, rotationY: 0, color: "#8aa4ff" },
      { id: "w2", x: 4, z: 4, width: 8, depth: 0.2, height: 3, rotationY: Math.PI / 2, color: "#8aa4ff" },
      { id: "w3", x: 0, z: 8, width: 8, depth: 0.2, height: 3, rotationY: 0, color: "#8aa4ff" },
      { id: "w4", x: -4, z: 4, width: 8, depth: 0.2, height: 3, rotationY: Math.PI / 2, color: "#8aa4ff" }
    ],
    openings: [
      { id: "o1", wallId: "w1", kind: "door", offset: 0, width: 0.9, height: 2.1, sillHeight: 0 },
      { id: "o2", wallId: "w2", kind: "window", offset: -1.5, width: 1.2, height: 1.2, sillHeight: 1 }
    ],
    camera: { mode: "orthographic", preset: "iso" }
  }
});

const readDesignStore = (): DesignRecord[] => {
  if (typeof window === "undefined") {
    return [buildSampleDesign()];
  }

  try {
    const raw = window.localStorage.getItem(DESIGN_STORAGE_KEY);
    if (!raw) {
      const seeded = [buildSampleDesign()];
      window.localStorage.setItem(DESIGN_STORAGE_KEY, JSON.stringify(seeded));
      return seeded;
    }

    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed as DesignRecord[];
    }
  } catch (err) {
    console.error(err);
  }

  const seeded = [buildSampleDesign()];
  window.localStorage.setItem(DESIGN_STORAGE_KEY, JSON.stringify(seeded));
  return seeded;
};

const writeDesignStore = (designs: DesignRecord[]) => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(DESIGN_STORAGE_KEY, JSON.stringify(designs));
};

const axiosApi = axios.create({
  baseURL: API_URL ? `${API_URL}/api` : "/api"
});

axiosApi.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export const hasConfiguredApiUrl = Boolean(API_URL);
export const configuredApiUrl = API_URL || "http://localhost:5001";
export const isDemoMode = !hasConfiguredApiUrl;

const shouldFallbackToDemo = (error: any) => {
  if (!hasConfiguredApiUrl) {
    return false;
  }

  if (!error?.response) {
    return true;
  }

  const status = Number(error.response.status);
  return status === 404 || status >= 500;
};

const requestWithFallback = async <T = any>(
  method: "get" | "post" | "delete",
  path: string,
  payload?: any,
  config?: any
) => {
  if (!hasConfiguredApiUrl) {
    return (mockApi[method] as any)(path, payload, config) as ApiResponse<T>;
  }

  try {
    if (method === "get") {
      return await axiosApi.get<T>(path, config);
    }

    if (method === "delete") {
      return await axiosApi.delete<T>(path, config);
    }

    return await axiosApi.post<T>(path, payload, config);
  } catch (error: any) {
    if (!shouldFallbackToDemo(error)) {
      throw error;
    }

    return (mockApi[method] as any)(path, payload, config) as ApiResponse<T>;
  }
};

const mockApi: any = {
  get: async (path: string): ApiResponse<any> => {
    await delay(120);

    switch (path) {
      case "/projects":
        return { data: { projects: demoProjects } };
      case "/team/overview":
        return { data: buildDemoTeamOverview() };
      case "/reports/summary":
        return { data: buildDemoReportsSummary() };
      case "/designs":
        return { data: readDesignStore() };
      default: {
        if (path.startsWith("/designs/")) {
          const id = path.split("/").filter(Boolean).pop() || "";
          const design = readDesignStore().find((entry) => entry.id === id);
          if (design) {
            return { data: design };
          }

          throw createAxiosError(404, "Design not found");
        }

        throw createAxiosError(404, `Demo mode does not implement ${path}`);
      }
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

      case "/ai/optimize-workflow": {
        return { data: buildOptimization(payload || {}) };
      }

      case "/ai/predict-cost-overrun": {
        return { data: buildCostRisk(payload || {}) };
      }

      case "/ai/predict-safety-risk": {
        return { data: buildSafetyRisk(payload || {}) };
      }

      case "/ai/predict-equipment-failure": {
        return { data: buildEquipmentFailure(payload || {}) };
      }

      case "/assistant/chat": {
        const message = typeof payload?.message === "string" ? payload.message : "";
        return { data: getAssistantReply(message) };
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
      case "/designs": {
        const designs = readDesignStore();
        const body = payload || {};
        const now = new Date().toISOString();
        const designData = {
          walls: Array.isArray(body.data?.walls) ? body.data.walls : [],
          openings: Array.isArray(body.data?.openings) ? body.data.openings : [],
          camera: body.data?.camera && typeof body.data.camera === "object" ? body.data.camera : { mode: "orthographic", preset: "iso" }
        };
        const created: DesignRecord = {
          id: `design-${Date.now().toString(36)}`,
          name: typeof body.name === "string" && body.name.trim() ? body.name.trim() : "Untitled Design",
          createdAt: now,
          updatedAt: now,
          data: designData
        };

        const nextDesigns = [created, ...designs.filter((entry) => entry.id !== buildSampleDesign().id)];
        writeDesignStore(nextDesigns);
        return { data: created };
      }

      default:
        throw createAxiosError(404, `Demo mode does not implement ${path}`);
    }
  },
  delete: async (path: string): ApiResponse<any> => {
    await delay(120);

    if (!path.startsWith("/designs/")) {
      throw createAxiosError(404, `Demo mode does not implement ${path}`);
    }

    const id = path.split("/").filter(Boolean).pop() || "";
    const current = readDesignStore();
    const remaining = current.filter((entry) => entry.id !== id);
    const nextDesigns = remaining.length > 0 ? remaining : [buildSampleDesign()];
    writeDesignStore(nextDesigns);

    return { data: null };
  }
};

export const api = {
  get: <T = any>(path: string, config?: any) => requestWithFallback<T>("get", path, undefined, config),
  post: <T = any>(path: string, payload?: any, config?: any) => requestWithFallback<T>("post", path, payload, config),
  delete: <T = any>(path: string, config?: any) => requestWithFallback<T>("delete", path, undefined, config)
};
