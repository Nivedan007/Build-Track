import {
  AlertTriangle,
  ArrowUpRight,
  Building2,
  CalendarClock,
  CheckCircle2,
  IndianRupee,
  ShieldAlert,
  Sparkles,
  Users
} from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { AnimatedCard } from "@/components/ui/AnimatedCard";
import { ProgressChart } from "@/components/charts/ProgressChart";

const actions = [
  { title: "Approve revised budget", project: "Metro Link Station Block", risk: "High", owner: "Finance" },
  { title: "Resolve material shortage", project: "Skyline Towers Phase A", risk: "Medium", owner: "Procurement" },
  { title: "Close overdue safety audit", project: "Green Residences", risk: "High", owner: "Safety Lead" }
];

const updates = [
  { label: "Concrete QA cleared for Tower A", time: "12m ago", type: "success" },
  { label: "Rain alert issued for Bengaluru site", time: "34m ago", type: "warning" },
  { label: "Vendor invoice mismatch detected", time: "1h ago", type: "error" },
  { label: "Crew utilization reached 93%", time: "2h ago", type: "success" }
];

export default function DashboardPage() {
  return (
    <main className="pb-20">
      <TopBar />
      <section className="mx-auto mt-10 w-[92%] max-w-7xl space-y-8">
        <div className="panel overflow-hidden rounded-3xl px-6 py-6 md:px-8">
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-sky-300">Executive Overview</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
                Program Health Is Stable, 3 Critical Actions Pending
              </h2>
              <p className="mt-3 max-w-2xl text-sm text-slate-300">
                AI prediction confidence improved by 9.4% this week. Cross-functional blockers are concentrated in
                procurement and weather-sensitive milestones.
              </p>
            </div>
            <div className="grid gap-3 rounded-2xl border border-sky-300/20 bg-sky-400/10 px-4 py-3 text-sm md:min-w-72">
              <p className="font-semibold text-sky-100">Forecast Update</p>
              <div className="flex items-center justify-between">
                <span className="text-slate-200">On-time completion probability</span>
                <span className="font-semibold text-sky-200">78%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-200">Risk trend</span>
                <span className="inline-flex items-center gap-1 font-semibold text-emerald-300">
                  Improving <ArrowUpRight className="h-4 w-4" />
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <AnimatedCard title="Active Projects" value="12" subtitle="+2 this week" />
          <AnimatedCard title="At-Risk Projects" value="3" subtitle="Needs immediate review" />
          <AnimatedCard title="Workforce On-site" value="187" subtitle="93% attendance" />
          <AnimatedCard title="Budget Utilization" value="64%" subtitle="Within target range" />
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="glass flex items-center gap-3 rounded-2xl p-4"><Building2 className="text-sky-300" /> Multi-site tracking</div>
          <div className="glass flex items-center gap-3 rounded-2xl p-4"><AlertTriangle className="text-amber-300" /> Delay signals monitored</div>
          <div className="glass flex items-center gap-3 rounded-2xl p-4"><Users className="text-mint-300" /> Role-based collaboration</div>
          <div className="glass flex items-center gap-3 rounded-2xl p-4"><IndianRupee className="text-rose-300" /> Budget health insights</div>
        </div>

        <ProgressChart />

        <div className="grid gap-6 xl:grid-cols-3">
          <article className="panel rounded-2xl p-5 xl:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Action Center</h3>
              <span className="badge text-amber-300">Priority Queue</span>
            </div>
            <div className="space-y-3">
              {actions.map((action) => (
                <div key={action.title} className="rounded-xl border border-slate-700/60 bg-slate-950/30 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-medium">{action.title}</p>
                    <span className={`badge ${action.risk === "High" ? "text-rose-300" : "text-amber-300"}`}>
                      {action.risk} Risk
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-slate-300">{action.project}</p>
                  <p className="mt-2 text-xs uppercase tracking-wider text-slate-400">Owner: {action.owner}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="panel rounded-2xl p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Live Feed</h3>
              <Sparkles className="h-4 w-4 text-sky-300" />
            </div>
            <div className="space-y-3">
              {updates.map((item) => (
                <div key={item.label} className="rounded-xl border border-slate-700/60 bg-slate-950/35 px-3 py-2.5">
                  <div className="flex items-start gap-2">
                    {item.type === "success" && <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-300" />}
                    {item.type === "warning" && <CalendarClock className="mt-0.5 h-4 w-4 text-amber-300" />}
                    {item.type === "error" && <ShieldAlert className="mt-0.5 h-4 w-4 text-rose-300" />}
                    <div>
                      <p className="text-sm text-slate-200">{item.label}</p>
                      <p className="text-xs text-slate-400">{item.time}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}
