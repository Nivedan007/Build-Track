"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, ArrowRight, BadgeAlert, Brain, Calculator, LineChart, Sparkles, SlidersHorizontal, Target } from "lucide-react";
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
      </section>
    </main>
  );
}
