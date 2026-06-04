"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, ArrowRight, BadgeAlert, Brain, Calculator, LineChart, Sparkles, SlidersHorizontal, Target, ShieldAlert, Activity } from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { api } from "@/lib/api";
import { useRoleGuard } from "@/hooks/useRoleGuard";

type Result = {
  delayProbability: number;
  estimatedCompletionDate: string;
  riskBand: "LOW" | "MEDIUM" | "HIGH";
};

type OptimizationResult = {
  efficiencyScore: number;
  efficiencyBand: "LOW" | "MEDIUM" | "HIGH";
  recommendedCrewSize: number;
  recommendedOvertimeHours: number;
  expectedProductivityGain: number;
  priorityActions: string[];
  bottlenecks: Array<{ label: string; risk: number }>;
};

type CostRiskResult = {
  costOverrunProbability: number;
  expectedOverrunPercent: number;
  riskBand: "LOW" | "MEDIUM" | "HIGH";
  mitigationActions: string[];
};

type SafetyRiskResult = {
  safetyIncidentProbability: number;
  riskBand: "LOW" | "MEDIUM" | "HIGH";
  preventativeRecommendations: string[];
};

const defaultForm = {
  weatherRisk: 0.28,
  pastDelays: 1,
  attendanceRate: 0.92,
  materialShortages: 1,
  currentProgress: 61
};

const optimizationDefaultForm = {
  weatherRisk: 0.24,
  crewUtilization: 0.82,
  materialReadiness: 0.79,
  taskBacklog: 6,
  overtimeHours: 4,
  currentProgress: 64,
  skillMatch: 0.84
};

const costDefaultForm = {
  projectBudget: 500000,
  durationDays: 90,
  taskCount: 20,
  highPriorityTaskCount: 2,
  averageAttendanceRate: 0.90,
  weatherRisk: 0.20,
  materialShortages: 1
};

const safetyDefaultForm = {
  workerCount: 120,
  overtimeHoursAverage: 2.5,
  safetyCertRate: 0.90,
  weatherSeverity: 0.20,
  scaffoldingActivity: 0,
  heavyMachineryCount: 3,
  lastSafetyAuditDays: 4
};

export default function AiAnalystPage() {
  const gate = useRoleGuard(["ADMIN", "PROJECT_MANAGER", "SITE_ENGINEER", "CLIENT", "WORKER"]);
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [optimizationForm, setOptimizationForm] = useState(optimizationDefaultForm);
  const [optimizationLoading, setOptimizationLoading] = useState(false);
  const [optimizationError, setOptimizationError] = useState("");
  const [optimizationResult, setOptimizationResult] = useState<OptimizationResult | null>(null);
  const [costForm, setCostForm] = useState(costDefaultForm);
  const [costLoading, setCostLoading] = useState(false);
  const [costError, setCostError] = useState("");
  const [costResult, setCostResult] = useState<CostRiskResult | null>(null);
  const [safetyForm, setSafetyForm] = useState(safetyDefaultForm);
  const [safetyLoading, setSafetyLoading] = useState(false);
  const [safetyError, setSafetyError] = useState("");
  const [safetyResult, setSafetyResult] = useState<SafetyRiskResult | null>(null);

  const summary = useMemo(() => {
    if (!result) return { title: "Run an assessment", description: "Tune the inputs and generate a delay forecast in seconds." };

    if (result.riskBand === "HIGH") {
      return { title: "Immediate intervention required", description: "High delay risk. Escalate procurement, staffing, and weather contingency plans." };
    }

    if (result.riskBand === "MEDIUM") {
      return { title: "Monitor closely", description: "Moderate risk. Focus on schedule protection and supplier follow-up." };
    }

    return { title: "Healthy delivery outlook", description: "Low risk. Continue current execution pace with standard monitoring." };
  }, [result]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await api.post("/ai/predict-delay", form);
      setResult(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Unable to run prediction right now.");
    } finally {
      setLoading(false);
    }
  };

  const handleOptimizationSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setOptimizationLoading(true);
    setOptimizationError("");

    try {
      const response = await api.post("/ai/optimize-workflow", optimizationForm);
      setOptimizationResult(response.data);
    } catch (err: any) {
      setOptimizationError(err.response?.data?.message || "Unable to optimize workflow right now.");
    } finally {
      setOptimizationLoading(false);
    }
  };

  const handleCostSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setCostLoading(true);
    setCostError("");

    try {
      const response = await api.post("/ai/predict-cost-overrun", costForm);
      setCostResult(response.data);
    } catch (err: any) {
      setCostError(err.response?.data?.message || "Unable to run budget risk prediction right now.");
    } finally {
      setCostLoading(false);
    }
  };

  const handleSafetySubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSafetyLoading(true);
    setSafetyError("");

    try {
      const response = await api.post("/ai/predict-safety-risk", safetyForm);
      setSafetyResult(response.data);
    } catch (err: any) {
      setSafetyError(err.response?.data?.message || "Unable to run safety risk prediction right now.");
    } finally {
      setSafetyLoading(false);
    }
  };

  if (!gate.allowed) {
    return (
      <main className="pb-20">
        <TopBar />
        <section className="mx-auto mt-10 w-[92%] max-w-3xl">
          <div className="panel rounded-2xl p-6">
            <h2 className="text-2xl font-semibold">AI Analyst Access Restricted</h2>
            <p className="mt-2 text-sm text-slate-300">{gate.reason}</p>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="pb-20">
      <TopBar />
      <section className="mx-auto mt-10 w-[92%] max-w-7xl space-y-6">
        <div className="panel rounded-3xl p-6 md:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-sky-300">AI Risk Analyst</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">Predict delays before they happen.</h2>
              <p className="mt-3 max-w-2xl text-sm text-slate-300">
                Turn weather, attendance, material and progress signals into a decision-ready forecast with a clear action summary.
              </p>
            </div>
            <div className="grid gap-3 rounded-2xl border border-sky-300/20 bg-sky-400/10 px-4 py-3 text-sm md:min-w-72">
              <div className="flex items-center gap-2 text-sky-100">
                <Brain className="h-4 w-4" />
                Powered by the live AI service
              </div>
              <div className="flex items-center gap-2 text-slate-200">
                <Sparkles className="h-4 w-4 text-emerald-300" />
                Production-style decision support
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="panel rounded-3xl p-6"
          >
            <div className="mb-5 flex items-center gap-2">
              <Calculator className="h-4 w-4 text-sky-300" />
              <h3 className="text-lg font-semibold">Forecast Inputs</h3>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2 text-sm text-slate-300">
                <span className="flex items-center justify-between">
                  Weather risk <span className="text-slate-400">{form.weatherRisk.toFixed(2)}</span>
                </span>
                <input type="range" min="0" max="1" step="0.01" value={form.weatherRisk} onChange={(e) => setForm((v) => ({ ...v, weatherRisk: Number(e.target.value) }))} className="w-full accent-sky-400" />
              </label>

              <label className="space-y-2 text-sm text-slate-300">
                <span className="flex items-center justify-between">
                  Past delays <span className="text-slate-400">{form.pastDelays}</span>
                </span>
                <input type="range" min="0" max="10" step="1" value={form.pastDelays} onChange={(e) => setForm((v) => ({ ...v, pastDelays: Number(e.target.value) }))} className="w-full accent-sky-400" />
              </label>

              <label className="space-y-2 text-sm text-slate-300">
                <span className="flex items-center justify-between">
                  Attendance rate <span className="text-slate-400">{Math.round(form.attendanceRate * 100)}%</span>
                </span>
                <input type="range" min="0.5" max="1" step="0.01" value={form.attendanceRate} onChange={(e) => setForm((v) => ({ ...v, attendanceRate: Number(e.target.value) }))} className="w-full accent-emerald-300" />
              </label>

              <label className="space-y-2 text-sm text-slate-300">
                <span className="flex items-center justify-between">
                  Material shortages <span className="text-slate-400">{form.materialShortages}</span>
                </span>
                <input type="range" min="0" max="8" step="1" value={form.materialShortages} onChange={(e) => setForm((v) => ({ ...v, materialShortages: Number(e.target.value) }))} className="w-full accent-amber-300" />
              </label>

              <label className="space-y-2 text-sm text-slate-300 md:col-span-2">
                <span className="flex items-center justify-between">
                  Current progress <span className="text-slate-400">{form.currentProgress}%</span>
                </span>
                <input type="range" min="0" max="100" step="1" value={form.currentProgress} onChange={(e) => setForm((v) => ({ ...v, currentProgress: Number(e.target.value) }))} className="w-full accent-sky-400" />
              </label>
            </div>

            {error && <p className="mt-4 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-sky-400 px-5 py-3 font-semibold text-slate-950 transition hover:bg-sky-300 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "Analyzing..." : "Run Prediction"}
              <ArrowRight className="h-4 w-4" />
            </button>
          </motion.form>

          <div className="space-y-4">
            <div className="panel rounded-3xl p-6">
              <div className="flex items-center gap-2">
                <LineChart className="h-4 w-4 text-sky-300" />
                <h3 className="text-lg font-semibold">Forecast Output</h3>
              </div>

              {result ? (
                <div className="mt-5 space-y-4">
                  <div className="grid gap-3 md:grid-cols-3">
                    <div className="rounded-2xl border border-slate-700/60 bg-slate-950/35 p-4">
                      <p className="text-xs uppercase tracking-wider text-slate-400">Delay Probability</p>
                      <p className="mt-2 text-3xl font-semibold text-sky-200">{Math.round(result.delayProbability * 100)}%</p>
                    </div>
                    <div className="rounded-2xl border border-slate-700/60 bg-slate-950/35 p-4">
                      <p className="text-xs uppercase tracking-wider text-slate-400">Risk Band</p>
                      <p className={`mt-2 text-3xl font-semibold ${result.riskBand === "HIGH" ? "text-rose-300" : result.riskBand === "MEDIUM" ? "text-amber-300" : "text-emerald-300"}`}>
                        {result.riskBand}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-slate-700/60 bg-slate-950/35 p-4">
                      <p className="text-xs uppercase tracking-wider text-slate-400">Completion Date</p>
                      <p className="mt-2 text-lg font-semibold text-slate-100">{new Date(result.estimatedCompletionDate).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-700/60 bg-slate-950/35 p-5">
                    <p className="text-sm uppercase tracking-wider text-slate-400">Decision Summary</p>
                    <h4 className="mt-2 text-xl font-semibold">{summary.title}</h4>
                    <p className="mt-2 text-sm text-slate-300">{summary.description}</p>
                  </div>

                  <div className="rounded-2xl border border-sky-300/20 bg-sky-400/10 p-5 text-sm text-slate-100">
                    <div className="flex items-center gap-2 font-semibold text-sky-100">
                      <AlertTriangle className="h-4 w-4" />
                      Recommended next move
                    </div>
                    <p className="mt-2 text-slate-200">
                      Rebalance crews, lock supplier commitments, and raise contingency visibility to management.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="mt-5 rounded-2xl border border-dashed border-slate-700/70 bg-slate-950/30 p-8 text-sm text-slate-400">
                  Your prediction result will appear here after the first assessment.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <motion.form
            onSubmit={handleOptimizationSubmit}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="panel rounded-3xl p-6"
          >
            <div className="mb-5 flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-emerald-300" />
              <h3 className="text-lg font-semibold">Workflow Efficiency Optimizer</h3>
            </div>

            <p className="mb-5 text-sm text-slate-300">
              Generate an efficient resource plan using crew load, material readiness, backlog, overtime, weather, and skill matching.
            </p>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2 text-sm text-slate-300">
                <span className="flex items-center justify-between">
                  Crew utilization <span className="text-slate-400">{Math.round(optimizationForm.crewUtilization * 100)}%</span>
                </span>
                <input type="range" min="0.35" max="1" step="0.01" value={optimizationForm.crewUtilization} onChange={(e) => setOptimizationForm((v) => ({ ...v, crewUtilization: Number(e.target.value) }))} className="w-full accent-emerald-300" />
              </label>

              <label className="space-y-2 text-sm text-slate-300">
                <span className="flex items-center justify-between">
                  Material readiness <span className="text-slate-400">{Math.round(optimizationForm.materialReadiness * 100)}%</span>
                </span>
                <input type="range" min="0.35" max="1" step="0.01" value={optimizationForm.materialReadiness} onChange={(e) => setOptimizationForm((v) => ({ ...v, materialReadiness: Number(e.target.value) }))} className="w-full accent-sky-400" />
              </label>

              <label className="space-y-2 text-sm text-slate-300">
                <span className="flex items-center justify-between">
                  Task backlog <span className="text-slate-400">{optimizationForm.taskBacklog}</span>
                </span>
                <input type="range" min="0" max="25" step="1" value={optimizationForm.taskBacklog} onChange={(e) => setOptimizationForm((v) => ({ ...v, taskBacklog: Number(e.target.value) }))} className="w-full accent-amber-300" />
              </label>

              <label className="space-y-2 text-sm text-slate-300">
                <span className="flex items-center justify-between">
                  Overtime hours <span className="text-slate-400">{optimizationForm.overtimeHours}</span>
                </span>
                <input type="range" min="0" max="16" step="1" value={optimizationForm.overtimeHours} onChange={(e) => setOptimizationForm((v) => ({ ...v, overtimeHours: Number(e.target.value) }))} className="w-full accent-rose-300" />
              </label>

              <label className="space-y-2 text-sm text-slate-300">
                <span className="flex items-center justify-between">
                  Weather risk <span className="text-slate-400">{optimizationForm.weatherRisk.toFixed(2)}</span>
                </span>
                <input type="range" min="0" max="1" step="0.01" value={optimizationForm.weatherRisk} onChange={(e) => setOptimizationForm((v) => ({ ...v, weatherRisk: Number(e.target.value) }))} className="w-full accent-sky-400" />
              </label>

              <label className="space-y-2 text-sm text-slate-300">
                <span className="flex items-center justify-between">
                  Skill match <span className="text-slate-400">{Math.round(optimizationForm.skillMatch * 100)}%</span>
                </span>
                <input type="range" min="0.35" max="1" step="0.01" value={optimizationForm.skillMatch} onChange={(e) => setOptimizationForm((v) => ({ ...v, skillMatch: Number(e.target.value) }))} className="w-full accent-emerald-300" />
              </label>

              <label className="space-y-2 text-sm text-slate-300 md:col-span-2">
                <span className="flex items-center justify-between">
                  Current progress <span className="text-slate-400">{optimizationForm.currentProgress}%</span>
                </span>
                <input type="range" min="0" max="100" step="1" value={optimizationForm.currentProgress} onChange={(e) => setOptimizationForm((v) => ({ ...v, currentProgress: Number(e.target.value) }))} className="w-full accent-sky-400" />
              </label>
            </div>

            {optimizationError && <p className="mt-4 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{optimizationError}</p>}

            <button
              type="submit"
              disabled={optimizationLoading}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-400 px-5 py-3 font-semibold text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {optimizationLoading ? "Optimizing..." : "Optimize Workflow"}
              <Target className="h-4 w-4" />
            </button>
          </motion.form>

          <div className="space-y-4">
            <div className="panel rounded-3xl p-6">
              <div className="flex items-center gap-2">
                <BadgeAlert className="h-4 w-4 text-emerald-300" />
                <h3 className="text-lg font-semibold">Efficiency Output</h3>
              </div>

              {optimizationResult ? (
                <div className="mt-5 space-y-4">
                  <div className="grid gap-3 md:grid-cols-3">
                    <div className="rounded-2xl border border-slate-700/60 bg-slate-950/35 p-4">
                      <p className="text-xs uppercase tracking-wider text-slate-400">Efficiency Score</p>
                      <p className="mt-2 text-3xl font-semibold text-emerald-200">{Math.round(optimizationResult.efficiencyScore)}%</p>
                    </div>
                    <div className="rounded-2xl border border-slate-700/60 bg-slate-950/35 p-4">
                      <p className="text-xs uppercase tracking-wider text-slate-400">Crew Size</p>
                      <p className={`mt-2 text-3xl font-semibold ${optimizationResult.efficiencyBand === "HIGH" ? "text-emerald-300" : optimizationResult.efficiencyBand === "MEDIUM" ? "text-amber-300" : "text-rose-300"}`}>
                        {optimizationResult.recommendedCrewSize}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-slate-700/60 bg-slate-950/35 p-4">
                      <p className="text-xs uppercase tracking-wider text-slate-400">Overtime Cap</p>
                      <p className="mt-2 text-3xl font-semibold text-sky-200">{optimizationResult.recommendedOvertimeHours}h</p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-700/60 bg-slate-950/35 p-5">
                    <p className="text-sm uppercase tracking-wider text-slate-400">Priority Actions</p>
                    <ul className="mt-3 space-y-2 text-sm text-slate-200">
                      {optimizationResult.priorityActions.map((action) => (
                        <li key={action} className="flex items-start gap-2">
                          <span className="mt-2 h-2 w-2 rounded-full bg-emerald-300" />
                          <span>{action}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="grid gap-3 md:grid-cols-3">
                    {optimizationResult.bottlenecks.map((item) => (
                      <div key={item.label} className="rounded-2xl border border-slate-700/60 bg-slate-950/35 p-4">
                        <p className="text-xs uppercase tracking-wider text-slate-400">{item.label}</p>
                        <p className="mt-2 text-2xl font-semibold text-slate-100">{Math.round(item.risk)}%</p>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-2xl border border-emerald-300/20 bg-emerald-400/10 p-5 text-sm text-slate-100">
                    <div className="flex items-center gap-2 font-semibold text-emerald-100">
                      <Target className="h-4 w-4" />
                      Expected productivity gain
                    </div>
                    <p className="mt-2 text-slate-200">+{optimizationResult.expectedProductivityGain}% if you follow the recommended actions this cycle.</p>
                  </div>
                </div>
              ) : (
                <div className="mt-5 rounded-2xl border border-dashed border-slate-700/70 bg-slate-950/30 p-8 text-sm text-slate-400">
                  Your efficiency plan will appear here after the first optimization.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <motion.form
            onSubmit={handleCostSubmit}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="panel rounded-3xl p-6"
          >
            <div className="mb-5 flex items-center gap-2">
              <Calculator className="h-4 w-4 text-amber-300" />
              <h3 className="text-lg font-semibold">Cost & Budget Risk Inputs</h3>
            </div>

            <p className="mb-5 text-sm text-slate-300">
              Estimate cost overrun probability and get proactive financial mitigation recommendations based on site workload and budget constraints.
            </p>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2 text-sm text-slate-300 md:col-span-2">
                <span className="flex items-center justify-between">
                  Project Budget (INR) <span className="text-slate-400">Rs. {new Intl.NumberFormat("en-IN").format(costForm.projectBudget)}</span>
                </span>
                <input
                  type="range"
                  min="50000"
                  max="10000000"
                  step="50000"
                  value={costForm.projectBudget}
                  onChange={(e) => setCostForm((v) => ({ ...v, projectBudget: Number(e.target.value) }))}
                  className="w-full accent-amber-400"
                />
              </label>

              <label className="space-y-2 text-sm text-slate-300">
                <span className="flex items-center justify-between">
                  Duration (Days) <span className="text-slate-400">{costForm.durationDays}</span>
                </span>
                <input
                  type="range"
                  min="15"
                  max="365"
                  step="5"
                  value={costForm.durationDays}
                  onChange={(e) => setCostForm((v) => ({ ...v, durationDays: Number(e.target.value) }))}
                  className="w-full accent-sky-400"
                />
              </label>

              <label className="space-y-2 text-sm text-slate-300">
                <span className="flex items-center justify-between">
                  Total Tasks <span className="text-slate-400">{costForm.taskCount}</span>
                </span>
                <input
                  type="range"
                  min="5"
                  max="150"
                  step="1"
                  value={costForm.taskCount}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setCostForm((v) => ({
                      ...v,
                      taskCount: val,
                      highPriorityTaskCount: Math.min(v.highPriorityTaskCount, val)
                    }));
                  }}
                  className="w-full accent-emerald-300"
                />
              </label>

              <label className="space-y-2 text-sm text-slate-300">
                <span className="flex items-center justify-between">
                  High Priority Tasks <span className="text-slate-400">{costForm.highPriorityTaskCount}</span>
                </span>
                <input
                  type="range"
                  min="0"
                  max={costForm.taskCount}
                  step="1"
                  value={costForm.highPriorityTaskCount}
                  onChange={(e) => setCostForm((v) => ({ ...v, highPriorityTaskCount: Number(e.target.value) }))}
                  className="w-full accent-rose-300"
                />
              </label>

              <label className="space-y-2 text-sm text-slate-300">
                <span className="flex items-center justify-between">
                  Labor Attendance <span className="text-slate-400">{Math.round(costForm.averageAttendanceRate * 100)}%</span>
                </span>
                <input
                  type="range"
                  min="0.4"
                  max="1.0"
                  step="0.01"
                  value={costForm.averageAttendanceRate}
                  onChange={(e) => setCostForm((v) => ({ ...v, averageAttendanceRate: Number(e.target.value) }))}
                  className="w-full accent-emerald-300"
                />
              </label>

              <label className="space-y-2 text-sm text-slate-300">
                <span className="flex items-center justify-between">
                  Weather Risk <span className="text-slate-400">{costForm.weatherRisk.toFixed(2)}</span>
                </span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={costForm.weatherRisk}
                  onChange={(e) => setCostForm((v) => ({ ...v, weatherRisk: Number(e.target.value) }))}
                  className="w-full accent-sky-400"
                />
              </label>

              <label className="space-y-2 text-sm text-slate-300">
                <span className="flex items-center justify-between">
                  Material Shortages <span className="text-slate-400">{costForm.materialShortages}</span>
                </span>
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="1"
                  value={costForm.materialShortages}
                  onChange={(e) => setCostForm((v) => ({ ...v, materialShortages: Number(e.target.value) }))}
                  className="w-full accent-amber-300"
                />
              </label>
            </div>

            {costError && <p className="mt-4 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{costError}</p>}

            <button
              type="submit"
              disabled={costLoading}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-amber-400 px-5 py-3 font-semibold text-slate-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {costLoading ? "Analyzing Cost Risk..." : "Predict Budget Overrun"}
              <LineChart className="h-4 w-4" />
            </button>
          </motion.form>

          <div className="space-y-4">
            <div className="panel rounded-3xl p-6">
              <div className="flex items-center gap-2">
                <BadgeAlert className="h-4 w-4 text-amber-300" />
                <h3 className="text-lg font-semibold">Cost Risk Prediction Output</h3>
              </div>

              {costResult ? (
                <div className="mt-5 space-y-4">
                  <div className="grid gap-3 md:grid-cols-3">
                    <div className="rounded-2xl border border-slate-700/60 bg-slate-950/35 p-4">
                      <p className="text-xs uppercase tracking-wider text-slate-400">Overrun Probability</p>
                      <p className="mt-2 text-3xl font-semibold text-amber-200">{Math.round(costResult.costOverrunProbability * 100)}%</p>
                    </div>
                    <div className="rounded-2xl border border-slate-700/60 bg-slate-950/35 p-4">
                      <p className="text-xs uppercase tracking-wider text-slate-400">Risk Band</p>
                      <p className={`mt-2 text-3xl font-semibold ${costResult.riskBand === "HIGH" ? "text-rose-300" : costResult.riskBand === "MEDIUM" ? "text-amber-300" : "text-emerald-300"}`}>
                        {costResult.riskBand}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-slate-700/60 bg-slate-950/35 p-4">
                      <p className="text-xs uppercase tracking-wider text-slate-400">Expected Overrun</p>
                      <p className="mt-2 text-xl font-semibold text-rose-300">+{costResult.expectedOverrunPercent}%</p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-700/60 bg-slate-950/35 p-5">
                    <p className="text-sm uppercase tracking-wider text-slate-400">Estimated Overrun Amount</p>
                    <p className="mt-2 text-3xl font-bold text-slate-100">
                      Rs. {new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format((costForm.projectBudget * costResult.expectedOverrunPercent) / 100)}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      Calculated from input budget of Rs. {new Intl.NumberFormat("en-IN").format(costForm.projectBudget)}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-700/60 bg-slate-950/35 p-5">
                    <p className="text-sm uppercase tracking-wider text-slate-400">Mitigation Actions</p>
                    <ul className="mt-3 space-y-2 text-sm text-slate-200">
                      {costResult.mitigationActions.map((action) => (
                        <li key={action} className="flex items-start gap-2">
                          <span className="mt-2 h-2 w-2 rounded-full bg-amber-300 animate-pulse" />
                          <span>{action}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className={`rounded-2xl border p-5 text-sm ${costResult.riskBand === "HIGH" ? "border-rose-300/20 bg-rose-400/10 text-rose-100" : costResult.riskBand === "MEDIUM" ? "border-amber-300/20 bg-amber-400/10 text-amber-100" : "border-emerald-300/20 bg-emerald-400/10 text-emerald-100"}`}>
                    <div className="flex items-center gap-2 font-semibold">
                      <AlertTriangle className="h-4 w-4" />
                      Financial Assessment Summary
                    </div>
                    <p className="mt-2 text-slate-200">
                      {costResult.riskBand === "HIGH" 
                        ? "High probability of overrun detected. Timeline compression or severe supplier shortage is jeopardizing current margins. Escalate budget reserves immediately."
                        : costResult.riskBand === "MEDIUM"
                        ? "Moderate cost risk. General schedule controls and vendor follow-up audits should suffice to protect margins."
                        : "Low budget risk. Standard bi-weekly auditing is sufficient to track progress."}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="mt-5 rounded-2xl border border-dashed border-slate-700/70 bg-slate-950/30 p-8 text-sm text-slate-400">
                  Your budget overrun assessment will appear here after the first calculation.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <motion.form
            onSubmit={handleSafetySubmit}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="panel rounded-3xl p-6"
          >
            <div className="mb-5 flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-rose-300" />
              <h3 className="text-lg font-semibold">Safety & Compliance Risk Predictor</h3>
            </div>

            <p className="mb-5 text-sm text-slate-300">
              Assess site safety compliance and calculate potential incident probabilities based on personnel fatigue, safety certification levels, hazard activity, and weather factors.
            </p>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2 text-sm text-slate-300">
                <span className="flex items-center justify-between">
                  Active Site Labor <span className="text-slate-400">{safetyForm.workerCount}</span>
                </span>
                <input
                  type="range"
                  min="10"
                  max="300"
                  step="5"
                  value={safetyForm.workerCount}
                  onChange={(e) => setSafetyForm((v) => ({ ...v, workerCount: Number(e.target.value) }))}
                  className="w-full accent-sky-400"
                />
              </label>

              <label className="space-y-2 text-sm text-slate-300">
                <span className="flex items-center justify-between">
                  Average Overtime Hours <span className="text-slate-400">{safetyForm.overtimeHoursAverage.toFixed(1)} hrs</span>
                </span>
                <input
                  type="range"
                  min="0"
                  max="12"
                  step="0.5"
                  value={safetyForm.overtimeHoursAverage}
                  onChange={(e) => setSafetyForm((v) => ({ ...v, overtimeHoursAverage: Number(e.target.value) }))}
                  className="w-full accent-rose-300"
                />
              </label>

              <label className="space-y-2 text-sm text-slate-300">
                <span className="flex items-center justify-between">
                  Safety Certification Rate <span className="text-slate-400">{Math.round(safetyForm.safetyCertRate * 100)}%</span>
                </span>
                <input
                  type="range"
                  min="0.4"
                  max="1.0"
                  step="0.01"
                  value={safetyForm.safetyCertRate}
                  onChange={(e) => setSafetyForm((v) => ({ ...v, safetyCertRate: Number(e.target.value) }))}
                  className="w-full accent-emerald-300"
                />
              </label>

              <label className="space-y-2 text-sm text-slate-300">
                <span className="flex items-center justify-between">
                  Weather Severity Index <span className="text-slate-400">{safetyForm.weatherSeverity.toFixed(2)}</span>
                </span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={safetyForm.weatherSeverity}
                  onChange={(e) => setSafetyForm((v) => ({ ...v, weatherSeverity: Number(e.target.value) }))}
                  className="w-full accent-sky-400"
                />
              </label>

              <label className="space-y-2 text-sm text-slate-300">
                <span className="flex items-center justify-between">
                  Active Heavy Machinery <span className="text-slate-400">{safetyForm.heavyMachineryCount} units</span>
                </span>
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="1"
                  value={safetyForm.heavyMachineryCount}
                  onChange={(e) => setSafetyForm((v) => ({ ...v, heavyMachineryCount: Number(e.target.value) }))}
                  className="w-full accent-amber-300"
                />
              </label>

              <label className="space-y-2 text-sm text-slate-300">
                <span className="flex items-center justify-between">
                  Days Since Last Audit <span className="text-slate-400">{safetyForm.lastSafetyAuditDays} days</span>
                </span>
                <input
                  type="range"
                  min="0"
                  max="30"
                  step="1"
                  value={safetyForm.lastSafetyAuditDays}
                  onChange={(e) => setSafetyForm((v) => ({ ...v, lastSafetyAuditDays: Number(e.target.value) }))}
                  className="w-full accent-sky-400"
                />
              </label>

              <label className="space-y-2 text-sm text-slate-300 md:col-span-2">
                <span className="flex items-center justify-between">
                  High-Altitude Scaffolding Active <span className="text-slate-400">{safetyForm.scaffoldingActivity === 1 ? "Yes" : "No"}</span>
                </span>
                <select
                  value={safetyForm.scaffoldingActivity}
                  onChange={(e) => setSafetyForm((v) => ({ ...v, scaffoldingActivity: Number(e.target.value) }))}
                  className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-4 py-2.5 outline-none focus:border-sky-400 text-slate-100"
                >
                  <option value={0}>No (Standard Ground Work)</option>
                  <option value={1}>Yes (Elevated / High-Altitude Work)</option>
                </select>
              </label>
            </div>

            {safetyError && <p className="mt-4 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{safetyError}</p>}

            <button
              type="submit"
              disabled={safetyLoading}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-rose-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-rose-400 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {safetyLoading ? "Analyzing Incident Risk..." : "Predict Safety Risk"}
              <Activity className="h-4 w-4 animate-pulse" />
            </button>
          </motion.form>

          <div className="space-y-4">
            <div className="panel rounded-3xl p-6">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-rose-300" />
                <h3 className="text-lg font-semibold">Incident Risk Assessment Output</h3>
              </div>

              {safetyResult ? (
                <div className="mt-5 space-y-4">
                  <div className="grid gap-3 md:grid-cols-3">
                    <div className="rounded-2xl border border-slate-700/60 bg-slate-950/35 p-4">
                      <p className="text-xs uppercase tracking-wider text-slate-400">Incident Probability</p>
                      <p className="mt-2 text-3xl font-semibold text-rose-200">{Math.round(safetyResult.safetyIncidentProbability * 100)}%</p>
                    </div>
                    <div className="rounded-2xl border border-slate-700/60 bg-slate-950/35 p-4">
                      <p className="text-xs uppercase tracking-wider text-slate-400">Risk Band</p>
                      <p className={`mt-2 text-3xl font-semibold ${safetyResult.riskBand === "HIGH" ? "text-rose-300" : safetyResult.riskBand === "MEDIUM" ? "text-amber-300" : "text-emerald-300"}`}>
                        {safetyResult.riskBand}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-slate-700/60 bg-slate-950/35 p-4">
                      <p className="text-xs uppercase tracking-wider text-slate-400">Site Safety Rating</p>
                      <p className={`mt-2 text-xl font-semibold ${safetyResult.riskBand === "HIGH" ? "text-rose-300" : safetyResult.riskBand === "MEDIUM" ? "text-amber-300" : "text-emerald-300"}`}>
                        {safetyResult.riskBand === "HIGH" ? "Critical Audit" : safetyResult.riskBand === "MEDIUM" ? "Warning" : "Excellent"}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-700/60 bg-slate-950/35 p-5">
                    <p className="text-sm uppercase tracking-wider text-slate-400">Preventative Recommendations</p>
                    <ul className="mt-3 space-y-2 text-sm text-slate-200">
                      {safetyResult.preventativeRecommendations.map((action) => (
                        <li key={action} className="flex items-start gap-2">
                          <span className="mt-2 h-2 w-2 rounded-full bg-rose-400 animate-pulse" />
                          <span>{action}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className={`rounded-2xl border p-5 text-sm ${safetyResult.riskBand === "HIGH" ? "border-rose-300/20 bg-rose-400/10 text-rose-100" : safetyResult.riskBand === "MEDIUM" ? "border-amber-300/20 bg-amber-400/10 text-amber-100" : "border-emerald-300/20 bg-emerald-400/10 text-emerald-100"}`}>
                    <div className="flex items-center gap-2 font-semibold">
                      <AlertTriangle className="h-4 w-4" />
                      Compliance Audit Summary
                    </div>
                    <p className="mt-2 text-slate-200">
                      {safetyResult.riskBand === "HIGH" 
                        ? "High probability of safety violation or incident. Worker fatigue or heavy machinery density combined with low certification rates is creating critical hazard points. Run audits immediately."
                        : safetyResult.riskBand === "MEDIUM"
                        ? "Moderate risk. General safety walkabout and toolbox talks refreshers are recommended to retain strict safety compliance."
                        : "Excellent site compliance. General protocol is sufficient to keep work progressing safely."}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="mt-5 rounded-2xl border border-dashed border-slate-700/70 bg-slate-950/30 p-8 text-sm text-slate-400">
                  Your safety incident and compliance forecast will appear here after analysis.
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
