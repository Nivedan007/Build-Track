"use client";

import {
  AlertTriangle,
  ArrowUpRight,
  Building2,
  CalendarClock,
  CheckCircle2,
  IndianRupee,
  ShieldAlert,
  Users,
  TrendingUp,
  Zap,
  Clock,
  Target,
  MapPinned,
  Activity,
  ShieldCheck,
  Sparkles,
  ArrowRight
} from "lucide-react";
import Image from "next/image";
import { TopBar } from "@/components/layout/TopBar";
import { AnimatedCard } from "@/components/ui/AnimatedCard";
import { ProgressChart } from "@/components/charts/ProgressChart";
import { AnimatedMetricCard, PulsingBadge, RotatingIcon, ScalingProgressBar } from "@/components/animations/ClientAnimationWrapper";

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

const metrics = [
  { icon: TrendingUp, label: "Productivity", value: "94%", change: "+5.2%", color: "text-emerald-300" },
  { icon: Zap, label: "Efficiency", value: "87%", change: "+2.1%", color: "text-cyan-300" },
  { icon: Clock, label: "On-time Rate", value: "82%", change: "-1.3%", color: "text-amber-300" },
  { icon: Target, label: "Budget Control", value: "79%", change: "+3.7%", color: "text-blue-300" }
];

export default function DashboardPage() {
  return (
    <main className="relative overflow-hidden pb-20">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.12),transparent_30%),radial-gradient(circle_at_70%_20%,rgba(34,197,94,0.08),transparent_18%),radial-gradient(circle_at_bottom_right,rgba(245,158,11,0.07),transparent_24%),linear-gradient(180deg,rgba(2,6,23,0.96),rgba(2,6,23,1))]" />
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-[0.12]" style={{ backgroundImage: "linear-gradient(rgba(56,189,248,0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(56,189,248,0.18) 1px, transparent 1px)", backgroundSize: "110px 110px" }} />
      <TopBar />
      <section className="mx-auto mt-8 w-[92%] max-w-[1600px] space-y-8">
        <div className="grid overflow-hidden rounded-[2.5rem] border border-slate-700/60 bg-[linear-gradient(135deg,rgba(2,6,23,0.98),rgba(15,23,42,0.98))] shadow-[0_40px_120px_rgba(2,8,23,0.55)] xl:grid-cols-[1.18fr_0.82fr]">
          <div className="relative min-h-[28rem] overflow-hidden p-6 sm:p-8 xl:p-10">
            <div className="absolute inset-0">
              <Image
                src="/construction-hero.svg"
                alt="Dashboard hero illustration"
                fill
                priority
                className="object-cover"
              />
              <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(2,6,23,0.84)_0%,rgba(2,6,23,0.42)_46%,rgba(2,6,23,0.86)_100%),linear-gradient(180deg,rgba(2,6,23,0.12),rgba(2,6,23,0.72))]" />
            </div>

            <div className="relative z-10 max-w-3xl">
              <p className="inline-flex items-center gap-2 rounded-full border border-sky-400/30 bg-sky-400/10 px-4 py-2 text-xs uppercase tracking-[0.22em] text-sky-300">
                <Sparkles className="h-3.5 w-3.5" />
                Executive Command Center
              </p>

              <h2 className="mt-6 max-w-3xl text-4xl font-semibold leading-[0.98] tracking-tight text-white sm:text-5xl xl:text-7xl">
                Building what matters, with intelligence at every step.
              </h2>

              <p className="mt-5 max-w-2xl text-sm text-slate-200/90 sm:text-base">
                Monitor projects, forecasts, teams, and cost control from one cinematic control room designed for leaders who want clarity without noise.
              </p>

              <div className="mt-8 flex flex-wrap gap-3 text-sm text-slate-200/90">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/8 px-4 py-2 backdrop-blur-md">
                  <ShieldCheck className="h-4 w-4 text-emerald-300" /> Secure role-based control
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/8 px-4 py-2 backdrop-blur-md">
                  <Activity className="h-4 w-4 text-sky-300" /> Live operations visibility
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/8 px-4 py-2 backdrop-blur-md">
                  <MapPinned className="h-4 w-4 text-amber-300" /> Multi-site command coverage
                </span>
              </div>
            </div>
          </div>

          <div className="relative flex flex-col justify-between gap-5 border-t border-slate-700/60 bg-slate-950/72 p-6 backdrop-blur-2xl xl:border-l xl:border-t-0 xl:p-8">
            <div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">Executive Overview</p>
                  <h3 className="mt-2 text-3xl font-semibold tracking-tight text-white md:text-4xl">
                    Program Health Is Stable, 3 Critical Actions Pending
                  </h3>
                </div>
                <div className="rounded-2xl border border-slate-700/60 bg-slate-950/60 px-4 py-3 text-right">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Forecast Update</p>
                  <p className="mt-1 text-2xl font-semibold text-cyan-200">78%</p>
                </div>
              </div>

              <p className="mt-4 max-w-xl text-sm text-slate-300">
                AI prediction confidence improved by 9.4% this week. Cross-functional blockers are concentrated in procurement and weather-sensitive milestones.
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-700/60 bg-slate-950/50 p-4">
                  <p className="text-xs uppercase tracking-wider text-slate-400">Risk trend</p>
                  <p className="mt-2 inline-flex items-center gap-1 font-semibold text-emerald-300">
                    Improving <ArrowUpRight className="h-4 w-4" />
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-700/60 bg-slate-950/50 p-4">
                  <p className="text-xs uppercase tracking-wider text-slate-400">Command mode</p>
                  <p className="mt-2 font-semibold text-white">Executive overview active</p>
                </div>
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-slate-700/60 bg-[linear-gradient(180deg,rgba(15,23,42,0.78),rgba(2,6,23,0.94))] p-4">
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-slate-700/60 bg-slate-950/55 p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-400">On-time completion</p>
                  <p className="mt-3 text-3xl font-semibold text-white">78%</p>
                </div>
                <div className="rounded-2xl border border-slate-700/60 bg-slate-950/55 p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Active sites</p>
                  <p className="mt-3 text-3xl font-semibold text-white">12</p>
                </div>
                <div className="rounded-2xl border border-slate-700/60 bg-gradient-to-br from-sky-400/15 via-slate-950/55 to-emerald-400/12 p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-300">Response</p>
                  <p className="mt-3 text-lg font-semibold text-white">Proceed with watchlist review</p>
                </div>
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

        {/* Real-time Metrics Grid */}
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {metrics.map((metric) => {
            const Icon = metric.icon;
            return (
              <AnimatedMetricCard key={metric.label}>
                <div className="card-gradient group h-full">
                  <div className="flex items-start justify-between mb-4">
                    <Icon className={`h-6 w-6 ${metric.color}`} />
                    <PulsingBadge>
                      <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-1 rounded-full">{metric.change}</span>
                    </PulsingBadge>
                  </div>
                  <p className="text-sm text-slate-400">{metric.label}</p>
                  <p className="text-3xl font-bold text-slate-100 mt-2">{metric.value}</p>
                  <div className="mt-3">
                    <ScalingProgressBar percentage={94} />
                  </div>
                </div>
              </AnimatedMetricCard>
            );
          })}
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="glass flex items-center gap-3 rounded-2xl border border-slate-700/60 bg-slate-950/55 p-4 transition hover:border-cyan-500/40">
            <Building2 className="text-cyan-300" /> Multi-site tracking
          </div>
          <div className="glass flex items-center gap-3 rounded-2xl border border-slate-700/60 bg-slate-950/55 p-4 transition hover:border-cyan-500/40">
            <AlertTriangle className="text-amber-300" /> Delay signals monitored
          </div>
          <div className="glass flex items-center gap-3 rounded-2xl border border-slate-700/60 bg-slate-950/55 p-4 transition hover:border-cyan-500/40">
            <Users className="text-emerald-300" /> Role-based collaboration
          </div>
          <div className="glass flex items-center gap-3 rounded-2xl border border-slate-700/60 bg-slate-950/55 p-4 transition hover:border-cyan-500/40">
            <IndianRupee className="text-blue-300" /> Budget health insights
          </div>
        </div>

        <ProgressChart />

        <div className="grid gap-6 xl:grid-cols-3">
          <article className="panel rounded-2xl p-5 xl:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Action Center</h3>
              <PulsingBadge><span className="badge text-amber-300">Priority Queue</span></PulsingBadge>
            </div>
            <div className="space-y-3">
              {actions.map((action) => (
                <div key={action.title} className="rounded-xl border border-slate-700/60 bg-slate-950/30 p-4 hover:bg-slate-950/60 transition">
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
              <RotatingIcon><Sparkles className="h-4 w-4 text-cyan-300" /></RotatingIcon>
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
