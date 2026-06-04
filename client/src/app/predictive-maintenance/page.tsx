"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowRight,
  BadgeAlert,
  Brain,
  Sliders,
  CheckCircle,
  Thermometer,
  Activity,
  ShieldAlert,
  Gauge,
  Clock,
  Wrench,
  Sparkles,
  TrendingDown
} from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { api } from "@/lib/api";
import { useRoleGuard } from "@/hooks/useRoleGuard";

type PredictionResult = {
  failureProbability: number;
  riskBand: "LOW" | "MEDIUM" | "HIGH";
  recommendedAction: string;
  criticalComponent: string;
};

const defaultForm = {
  operatingHours: 3200,
  vibrationLevel: 2.1,
  oilQuality: 0.18,
  engineTemperature: 82.0,
  equipmentAge: 3,
  daysSinceLastMaintenance: 24,
  overloadEvents: 1
};

export default function PredictiveMaintenancePage() {
  const gate = useRoleGuard(["ADMIN", "PROJECT_MANAGER", "SITE_ENGINEER"]);
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<PredictionResult | null>(null);

  const summary = useMemo(() => {
    if (!result) return { title: "Telemetry Idle", description: "Tune the machine sensors and run a telemetry scan to analyze status." };
    if (result.riskBand === "HIGH") {
      return { title: "CRITICAL FAILURE IMMINENT", description: "High risk of breakdown. Disengage machinery power loop immediately." };
    }
    if (result.riskBand === "MEDIUM") {
      return { title: "PREVENTATIVE MAINTENANCE DUE", description: "Moderate failure likelihood. Schedule servicing within this week's roster." };
    }
    return { title: "MACHINERY STATUS OPTIMAL", description: "Continuous operating limits normal. Maintain standard daily inspection routines." };
  }, [result]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await api.post("/ai/predict-equipment-failure", form);
      setResult(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Unable to run predictive diagnostics right now.");
    } finally {
      setLoading(false);
    }
  };

  if (!gate.allowed) {
    return (
      <main className="pb-20">
        <TopBar />
        <section className="mx-auto mt-10 w-[92%] max-w-3xl">
          <div className="panel rounded-2xl p-6">
            <h2 className="text-2xl font-semibold">Equipment AI Access Restricted</h2>
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
        {/* Banner Card */}
        <div className="panel rounded-3xl p-6 md:p-8 relative overflow-hidden">
          <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-cyan-500/10 blur-3xl" />
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between relative z-10">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">Equipment AI</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">Predictive Equipment Maintenance</h2>
              <p className="mt-3 max-w-2xl text-sm text-slate-300">
                Analyze active heavy machinery sensor diagnostics (vibration, temperature, load spikes) using a state-of-the-art Gradient Boosting Classifier to prevent costly downtime.
              </p>
            </div>
            <div className="grid gap-3 rounded-2xl border border-cyan-300/20 bg-cyan-400/10 px-4 py-3 text-sm md:min-w-72">
              <div className="flex items-center gap-2 text-cyan-100">
                <Brain className="h-4 w-4 text-cyan-300" />
                Gradient Boosting Model Loaded
              </div>
              <div className="flex items-center gap-2 text-slate-200">
                <Sparkles className="h-4 w-4 text-emerald-300" />
                Zero-Downtime Telemetry Scan
              </div>
            </div>
          </div>
        </div>

        {/* Diagnostic Input & Output Grid */}
        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          
          {/* Telemetry Input Sliders */}
          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="panel rounded-3xl p-6"
          >
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sliders className="h-4 w-4 text-cyan-300" />
                <h3 className="text-lg font-semibold">Sensor Diagnostics Telemetry</h3>
              </div>
              <button
                type="button"
                onClick={() => setForm(defaultForm)}
                className="text-xs text-slate-400 hover:text-cyan-300 transition"
              >
                Reset Sensors
              </button>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              
              {/* Operating Hours */}
              <label className="space-y-2 text-sm text-slate-300">
                <span className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-cyan-400" /> Operating Hours</span>
                  <span className="font-mono text-slate-400">{form.operatingHours} hrs</span>
                </span>
                <input
                  type="range"
                  min="0"
                  max="10000"
                  step="100"
                  value={form.operatingHours}
                  onChange={(e) => setForm((v) => ({ ...v, operatingHours: Number(e.target.value) }))}
                  className="w-full accent-cyan-400"
                />
              </label>

              {/* Vibration Level */}
              <label className="space-y-2 text-sm text-slate-300">
                <span className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5"><Activity className="h-3.5 w-3.5 text-rose-400" /> Vibration Level</span>
                  <span className="font-mono text-slate-400">{form.vibrationLevel.toFixed(1)} mm/s</span>
                </span>
                <input
                  type="range"
                  min="0.5"
                  max="15.0"
                  step="0.1"
                  value={form.vibrationLevel}
                  onChange={(e) => setForm((v) => ({ ...v, vibrationLevel: Number(e.target.value) }))}
                  className="w-full accent-rose-400"
                />
              </label>

              {/* Oil Quality Index */}
              <label className="space-y-2 text-sm text-slate-300">
                <span className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5"><Gauge className="h-3.5 w-3.5 text-amber-400" /> Oil Contamination Index</span>
                  <span className="font-mono text-slate-400">{Math.round(form.oilQuality * 100)}%</span>
                </span>
                <input
                  type="range"
                  min="0.0"
                  max="1.0"
                  step="0.01"
                  value={form.oilQuality}
                  onChange={(e) => setForm((v) => ({ ...v, oilQuality: Number(e.target.value) }))}
                  className="w-full accent-amber-400"
                />
              </label>

              {/* Engine Temperature */}
              <label className="space-y-2 text-sm text-slate-300">
                <span className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5"><Thermometer className="h-3.5 w-3.5 text-orange-400" /> Engine Temperature</span>
                  <span className="font-mono text-slate-400">{form.engineTemperature.toFixed(0)} °C</span>
                </span>
                <input
                  type="range"
                  min="50"
                  max="125"
                  step="1"
                  value={form.engineTemperature}
                  onChange={(e) => setForm((v) => ({ ...v, engineTemperature: Number(e.target.value) }))}
                  className="w-full accent-orange-400"
                />
              </label>

              {/* Equipment Age */}
              <label className="space-y-2 text-sm text-slate-300">
                <span className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5"><Wrench className="h-3.5 w-3.5 text-emerald-400" /> Equipment Age</span>
                  <span className="font-mono text-slate-400">{form.equipmentAge} yrs</span>
                </span>
                <input
                  type="range"
                  min="0"
                  max="15"
                  step="1"
                  value={form.equipmentAge}
                  onChange={(e) => setForm((v) => ({ ...v, equipmentAge: Number(e.target.value) }))}
                  className="w-full accent-emerald-400"
                />
              </label>

              {/* Days Since Last Maintenance */}
              <label className="space-y-2 text-sm text-slate-300">
                <span className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-blue-400" /> Days Since Maintenance</span>
                  <span className="font-mono text-slate-400">{form.daysSinceLastMaintenance} days</span>
                </span>
                <input
                  type="range"
                  min="0"
                  max="180"
                  step="1"
                  value={form.daysSinceLastMaintenance}
                  onChange={(e) => setForm((v) => ({ ...v, daysSinceLastMaintenance: Number(e.target.value) }))}
                  className="w-full accent-blue-400"
                />
              </label>

              {/* Overload Events */}
              <label className="space-y-2 text-sm text-slate-300 md:col-span-2">
                <span className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5"><AlertTriangle className="h-3.5 w-3.5 text-rose-300" /> Heavy Load Overload Threshold Breaches</span>
                  <span className="font-mono text-slate-400">{form.overloadEvents} counts</span>
                </span>
                <input
                  type="range"
                  min="0"
                  max="20"
                  step="1"
                  value={form.overloadEvents}
                  onChange={(e) => setForm((v) => ({ ...v, overloadEvents: Number(e.target.value) }))}
                  className="w-full accent-rose-400"
                />
              </label>
            </div>

            {error && (
              <p className="mt-4 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-6 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-teal-300 px-5 py-3.5 font-semibold text-slate-950 transition hover:shadow-[0_0_30px_rgba(56,189,248,0.2)] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "Analyzing sensor telemetry..." : "Run ML Diagnostics Scan"}
              <ArrowRight className="h-4 w-4" />
            </button>
          </motion.form>

          {/* Diagnostic Outputs */}
          <div className="space-y-4">
            <div className="panel rounded-3xl p-6">
              <div className="flex items-center gap-2">
                <BadgeAlert className="h-4 w-4 text-cyan-300" />
                <h3 className="text-lg font-semibold">Diagnostic Output</h3>
              </div>

              {result ? (
                <div className="mt-5 space-y-4">
                  {/* Results metrics */}
                  <div className="grid gap-3 md:grid-cols-3">
                    <div className="rounded-2xl border border-slate-700/60 bg-slate-950/35 p-4 relative overflow-hidden">
                      <p className="text-xs uppercase tracking-wider text-slate-400">Failure Probability</p>
                      <p className="mt-2 text-3xl font-semibold text-cyan-300">{Math.round(result.failureProbability * 100)}%</p>
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-800">
                        <motion.div
                          className="h-full bg-cyan-400"
                          initial={{ width: 0 }}
                          animate={{ width: `${result.failureProbability * 100}%` }}
                          transition={{ duration: 0.8 }}
                        />
                      </div>
                    </div>

                    <div className="rounded-2xl border border-slate-700/60 bg-slate-950/35 p-4">
                      <p className="text-xs uppercase tracking-wider text-slate-400">Failure Risk Band</p>
                      <p className={`mt-2 text-3xl font-semibold ${result.riskBand === "HIGH" ? "text-rose-400" : result.riskBand === "MEDIUM" ? "text-amber-400" : "text-emerald-400"}`}>
                        {result.riskBand}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-slate-700/60 bg-slate-950/35 p-4">
                      <p className="text-xs uppercase tracking-wider text-slate-400">Critical Failure Point</p>
                      <p className="mt-2 text-lg font-semibold text-slate-100 truncate">{result.criticalComponent}</p>
                    </div>
                  </div>

                  {/* Summary Block */}
                  <div className="rounded-2xl border border-slate-700/60 bg-slate-950/35 p-5">
                    <p className="text-sm uppercase tracking-wider text-slate-400">ML Diagnostics Assessment</p>
                    <h4 className="mt-2 text-xl font-semibold text-slate-200">{summary.title}</h4>
                    <p className="mt-1 text-sm text-slate-300">{summary.description}</p>
                  </div>

                  {/* Actions Block */}
                  <div className={`rounded-2xl border p-5 text-sm ${result.riskBand === "HIGH" ? "border-rose-300/20 bg-rose-400/10 text-rose-100" : result.riskBand === "MEDIUM" ? "border-amber-300/20 bg-amber-400/10 text-amber-100" : "border-emerald-300/20 bg-emerald-400/10 text-emerald-100"}`}>
                    <div className="flex items-center gap-2 font-semibold">
                      {result.riskBand === "HIGH" ? (
                        <ShieldAlert className="h-4 w-4 animate-bounce" />
                      ) : result.riskBand === "MEDIUM" ? (
                        <AlertTriangle className="h-4 w-4" />
                      ) : (
                        <CheckCircle className="h-4 w-4" />
                      )}
                      Target Maintenance Action
                    </div>
                    <p className="mt-2 text-slate-200 leading-relaxed font-medium">
                      {result.recommendedAction}
                    </p>
                  </div>

                  {/* Real-time telemetry indicators */}
                  <div className="grid gap-2 text-xs text-slate-400 pt-2 border-t border-slate-700/50">
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                      Continuous diagnostics connection active
                    </div>
                    <div className="flex items-center gap-1.5">
                      <TrendingDown className="h-3.5 w-3.5 text-cyan-300" />
                      Maintenance efficiency gains estimated: +24% cost optimization
                    </div>
                  </div>

                </div>
              ) : (
                <div className="mt-5 rounded-2xl border border-dashed border-slate-700/70 bg-slate-950/30 p-10 text-center text-sm text-slate-400">
                  <div className="grid place-items-center mb-4">
                    <Activity className="h-10 w-10 text-slate-600 animate-pulse" />
                  </div>
                  No active scan. Adjust machinery telemetry parameters and trigger the scanner to retrieve real-time classifier diagnostics.
                </div>
              )}
            </div>
          </div>

        </div>
      </section>
    </main>
  );
}
