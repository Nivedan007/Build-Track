"use client";

import { useEffect, useState } from "react";
import { Download, FileSpreadsheet, Filter, Sparkles, TrendingUp } from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { api } from "@/lib/api";
import { useRoleGuard } from "@/hooks/useRoleGuard";

interface ReportRow {
  name: string;
  owner: string;
  updated: string;
  status: string;
}

interface ReportMetrics {
  reportCoverage: number;
  forecastAccuracy: number;
  dueSoonTasks: number;
}

export default function ReportsPage() {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<ReportRow[]>([]);
  const [metrics, setMetrics] = useState<ReportMetrics>({
    reportCoverage: 0,
    forecastAccuracy: 0,
    dueSoonTasks: 0
  });
  const [error, setError] = useState("");
  const gate = useRoleGuard(["ADMIN", "PROJECT_MANAGER", "SITE_ENGINEER", "CLIENT"]);

  useEffect(() => {
    if (!gate.allowed) {
      setLoading(false);
      return;
    }

    let mounted = true;
    api
      .get("/reports/summary")
      .then((res: any) => {
        if (!mounted) return;
        setRows(res.data.reports || []);
        setMetrics({
          reportCoverage: res.data.metrics?.reportCoverage ?? 0,
          forecastAccuracy: res.data.metrics?.forecastAccuracy ?? 0,
          dueSoonTasks: res.data.metrics?.dueSoonTasks ?? 0
        });
      })
      .catch(() => {
        if (!mounted) return;
        setError("Unable to load reports right now.");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [gate.allowed]);

  if (!gate.allowed) {
    return (
      <main className="pb-20">
        <TopBar />
        <section className="mx-auto mt-10 w-[92%] max-w-3xl">
          <div className="panel rounded-2xl p-6">
            <h2 className="text-2xl font-semibold">Reports Access Restricted</h2>
            <p className="mt-2 text-sm text-slate-300">{gate.reason}</p>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="pb-20">
      <TopBar />
      <section className="mx-auto mt-10 w-[92%] max-w-7xl space-y-7">
        <div className="panel rounded-3xl p-6 md:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-sky-300">Analytics Workspace</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight">Executive Reporting Suite</h2>
              <p className="mt-2 max-w-2xl text-sm text-slate-300">
                Build and distribute portfolio reports with AI-generated narrative summaries and risk confidence scores.
              </p>
            </div>
            <button className="inline-flex items-center gap-2 self-start rounded-xl bg-sky-400 px-4 py-2.5 font-semibold text-slate-950 transition hover:bg-sky-300">
              <Download className="h-4 w-4" />
              Export All Reports
            </button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="glass rounded-2xl p-4">
            <p className="text-sm text-slate-300">Weekly Report Coverage</p>
            <p className="mt-2 text-3xl font-semibold">{metrics.reportCoverage}%</p>
            <p className="mt-2 text-xs uppercase tracking-wider text-emerald-300">+11% from last week</p>
          </div>
          <div className="glass rounded-2xl p-4">
            <p className="text-sm text-slate-300">Forecast Accuracy</p>
            <p className="mt-2 text-3xl font-semibold">{metrics.forecastAccuracy}%</p>
            <p className="mt-2 text-xs uppercase tracking-wider text-sky-300">AI tuned this morning</p>
          </div>
          <div className="glass rounded-2xl p-4">
            <p className="text-sm text-slate-300">Open Executive Requests</p>
            <p className="mt-2 text-3xl font-semibold">{metrics.dueSoonTasks}</p>
            <p className="mt-2 text-xs uppercase tracking-wider text-amber-300">3 due today</p>
          </div>
        </div>

        <article className="panel rounded-2xl p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-lg font-semibold">Available Reports</h3>
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <span className="inline-flex items-center gap-1 rounded-lg border border-slate-700/60 bg-slate-900/40 px-2.5 py-1.5">
                <Filter className="h-3.5 w-3.5" />
                Quarter: Q2
              </span>
              <span className="inline-flex items-center gap-1 rounded-lg border border-slate-700/60 bg-slate-900/40 px-2.5 py-1.5">
                <TrendingUp className="h-3.5 w-3.5" />
                Regional Rollup
              </span>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-700/60">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-900/70 text-slate-300">
                <tr>
                  <th className="px-4 py-3">Report</th>
                  <th className="px-4 py-3">Owner</th>
                  <th className="px-4 py-3">Last Updated</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr className="border-t border-slate-800 bg-slate-950/40">
                    <td colSpan={5} className="px-4 py-5 text-center text-slate-400">
                      Loading reports...
                    </td>
                  </tr>
                ) : rows.map((row) => (
                  <tr key={row.name} className="border-t border-slate-800 bg-slate-950/40">
                    <td className="px-4 py-3 font-medium">{row.name}</td>
                    <td className="px-4 py-3 text-slate-300">{row.owner}</td>
                    <td className="px-4 py-3 text-slate-300">{new Date(row.updated).toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={`badge ${row.status === "Ready" ? "text-emerald-300" : "text-amber-300"}`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button className="inline-flex items-center gap-1 rounded-lg border border-slate-700/70 px-2.5 py-1.5 text-xs text-slate-200 transition hover:bg-slate-800/70">
                        <FileSpreadsheet className="h-3.5 w-3.5" />
                        Open
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {error && <p className="mt-4 text-sm text-rose-300">{error}</p>}
        </article>

        <article className="glass rounded-2xl p-5">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-sky-300" />
            <h3 className="font-semibold">AI Narrative</h3>
          </div>
          <p className="mt-3 text-sm text-slate-300">
            Portfolio risk remains contained, but two projects are likely to breach milestone confidence thresholds within
            10 days if procurement latency persists. Recommend immediate supplier escalation and partial schedule resequencing.
          </p>
        </article>
      </section>
    </main>
  );
}
