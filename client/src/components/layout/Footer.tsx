import Link from "next/link";
import { Globe2, ShieldCheck, Sparkles, TimerReset } from "lucide-react";

export function Footer() {
  return (
    <footer className="mx-auto mt-14 w-[92%] max-w-7xl rounded-[2rem] border border-slate-700/60 bg-slate-950/55 px-6 py-6 soft-glow md:px-8">
      <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr] lg:items-center">
        <div>
          <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.2em] text-sky-300">
            <Sparkles className="h-3.5 w-3.5" />
            Global Construction Intelligence
          </div>
          <h3 className="mt-3 text-2xl font-semibold tracking-tight text-white md:text-3xl">
            Built for teams operating across regions, time zones, and delivery standards.
          </h3>
          <p className="mt-3 max-w-2xl text-sm text-slate-300">
            BuildTrack AI helps executives, project leaders, and site teams coordinate with confidence from planning to handover.
          </p>
        </div>

        <div className="grid gap-3 text-sm text-slate-300">
          <div className="flex items-center gap-3 rounded-2xl border border-slate-700/60 bg-slate-900/40 px-4 py-3">
            <Globe2 className="h-4 w-4 text-sky-300" />
            Multi-region operations · UTC-aware scheduling
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-slate-700/60 bg-slate-900/40 px-4 py-3">
            <ShieldCheck className="h-4 w-4 text-emerald-300" />
            Role-based governance · Audit-friendly controls
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-slate-700/60 bg-slate-900/40 px-4 py-3">
            <TimerReset className="h-4 w-4 text-amber-300" />
            Real-time operations · Always-on visibility
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 border-t border-slate-700/60 pt-5 text-sm text-slate-400 md:flex-row md:items-center md:justify-between">
        <p>© 2026 BuildTrack AI. Enterprise construction control for modern teams.</p>
        <div className="flex flex-wrap gap-4">
          <Link href="/dashboard" className="transition hover:text-white">Dashboard</Link>
          <Link href="/ai-analyst" className="transition hover:text-white">AI Analyst</Link>
          <Link href="/reports" className="transition hover:text-white">Reports</Link>
        </div>
      </div>
    </footer>
  );
}
