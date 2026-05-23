"use client";

import { useEffect, useState } from "react";
import { BriefcaseBusiness, CheckCircle2, ShieldCheck, UserRoundPlus, Users } from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { api } from "@/lib/api";
import { useRoleGuard } from "@/hooks/useRoleGuard";

interface TeamMember {
  id: string;
  name: string;
  role: string;
  location: string;
  utilization: number;
  status: string;
}

interface TeamMetrics {
  activeWorkforce: number;
  safetyCertifiedRate: number;
  openPositions: number;
  avgUtilization: number;
}

export default function TeamPage() {
  const [loading, setLoading] = useState(true);
  const [squad, setSquad] = useState<TeamMember[]>([]);
  const [metrics, setMetrics] = useState<TeamMetrics>({
    activeWorkforce: 0,
    safetyCertifiedRate: 0,
    openPositions: 0,
    avgUtilization: 0
  });
  const [error, setError] = useState("");
  const gate = useRoleGuard(["ADMIN", "PROJECT_MANAGER", "SITE_ENGINEER"]);

  useEffect(() => {
    if (!gate.allowed) {
      setLoading(false);
      return;
    }

    let mounted = true;
    api
      .get("/team/overview")
      .then((res: any) => {
        if (!mounted) return;
        setSquad(res.data.team || []);
        setMetrics({
          activeWorkforce: res.data.metrics?.activeWorkforce ?? 0,
          safetyCertifiedRate: res.data.metrics?.safetyCertifiedRate ?? 0,
          openPositions: res.data.metrics?.openPositions ?? 0,
          avgUtilization: res.data.metrics?.avgUtilization ?? 0
        });
      })
      .catch(() => {
        if (!mounted) return;
        setError("Unable to load team data right now.");
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
            <h2 className="text-2xl font-semibold">Team Access Restricted</h2>
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
              <p className="text-xs uppercase tracking-[0.2em] text-sky-300">People & Operations</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight">Workforce Command Center</h2>
              <p className="mt-2 max-w-2xl text-sm text-slate-300">
                Allocate specialist teams, balance utilization, and maintain safety readiness across active sites.
              </p>
            </div>
            <button className="inline-flex items-center gap-2 self-start rounded-xl bg-sky-400 px-4 py-2.5 font-semibold text-slate-950 transition hover:bg-sky-300">
              <UserRoundPlus className="h-4 w-4" />
              Add Team Member
            </button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <div className="glass rounded-2xl p-4">
            <p className="text-sm text-slate-300">Active Workforce</p>
            <p className="mt-2 text-3xl font-semibold">{metrics.activeWorkforce}</p>
          </div>
          <div className="glass rounded-2xl p-4">
            <p className="text-sm text-slate-300">Safety-Certified Crew</p>
            <p className="mt-2 text-3xl font-semibold">{metrics.safetyCertifiedRate}%</p>
          </div>
          <div className="glass rounded-2xl p-4">
            <p className="text-sm text-slate-300">Open Positions</p>
            <p className="mt-2 text-3xl font-semibold">{metrics.openPositions}</p>
          </div>
          <div className="glass rounded-2xl p-4">
            <p className="text-sm text-slate-300">Avg Utilization</p>
            <p className="mt-2 text-3xl font-semibold">{metrics.avgUtilization}%</p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <article className="panel rounded-2xl p-5 lg:col-span-2">
            <h3 className="mb-4 text-lg font-semibold">Core Team</h3>
            <div className="space-y-3">
              {loading ? (
                <div className="rounded-xl border border-slate-700/60 bg-slate-950/35 p-4 text-sm text-slate-400">
                  Loading team members...
                </div>
              ) : squad.map((person) => (
                <div key={person.name} className="rounded-xl border border-slate-700/60 bg-slate-950/35 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold">{person.name}</p>
                      <p className="text-sm text-slate-300">{person.role} · {person.location}</p>
                    </div>
                    <span className="badge text-sky-200">{person.status}</span>
                  </div>
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs text-slate-300">
                      <span>Utilization</span>
                      <span>{person.utilization}%</span>
                    </div>
                    <div className="mt-1 h-2 rounded-full bg-slate-800">
                      <div
                        className="h-2 rounded-full bg-gradient-to-r from-sky-400 to-emerald-300"
                        style={{ width: `${person.utilization}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {error && <p className="mt-4 text-sm text-rose-300">{error}</p>}
          </article>

          <article className="panel rounded-2xl p-5">
            <h3 className="mb-4 text-lg font-semibold">Operational Signals</h3>
            <div className="space-y-3">
              <div className="rounded-xl border border-slate-700/60 bg-slate-950/35 p-3">
                <p className="flex items-center gap-2 text-sm font-medium"><Users className="h-4 w-4 text-sky-300" /> Crew distribution balanced</p>
                <p className="mt-1 text-xs text-slate-400">No region exceeds 110% capacity.</p>
              </div>
              <div className="rounded-xl border border-slate-700/60 bg-slate-950/35 p-3">
                <p className="flex items-center gap-2 text-sm font-medium"><ShieldCheck className="h-4 w-4 text-emerald-300" /> Safety readiness above target</p>
                <p className="mt-1 text-xs text-slate-400">Mandatory drills completed on 4/5 sites.</p>
              </div>
              <div className="rounded-xl border border-slate-700/60 bg-slate-950/35 p-3">
                <p className="flex items-center gap-2 text-sm font-medium"><BriefcaseBusiness className="h-4 w-4 text-amber-300" /> Specialist gap in MEP team</p>
                <p className="mt-1 text-xs text-slate-400">Recommend two temporary contracts this sprint.</p>
              </div>
              <div className="rounded-xl border border-slate-700/60 bg-slate-950/35 p-3">
                <p className="flex items-center gap-2 text-sm font-medium"><CheckCircle2 className="h-4 w-4 text-emerald-300" /> Retention trend improving</p>
                <p className="mt-1 text-xs text-slate-400">Voluntary attrition down 18% month-over-month.</p>
              </div>
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}
