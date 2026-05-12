import Link from "next/link";
import { ArrowRight, BrainCircuit, LineChart, ShieldCheck, Sparkles, Telescope } from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { Footer } from "@/components/layout/Footer";

export default function HomePage() {
  return (
    <main className="pb-20">
      <TopBar />
      <section className="mx-auto mt-14 w-[92%] max-w-7xl">
        <div className="overflow-hidden rounded-[2rem] border border-slate-700/60 bg-[radial-gradient(circle_at_top_left,rgba(55,189,248,0.20),transparent_35%),linear-gradient(135deg,rgba(15,23,42,0.88),rgba(2,6,23,0.98))] p-8 shadow-[0_30px_90px_rgba(2,8,23,0.45)] lg:p-12">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-sky-400/30 bg-sky-400/10 px-4 py-2 text-xs uppercase tracking-[0.22em] text-sky-300">
                <Sparkles className="h-3.5 w-3.5" />
                AI + Construction Ops
              </p>
              <h2 className="max-w-3xl text-4xl font-bold leading-tight tracking-tight md:text-6xl">
                Run projects like a world-class enterprise with AI-guided control.
              </h2>
              <p className="mt-5 max-w-2xl text-lg text-slate-300">
                Plan, predict, and execute with an executive dashboard, live team coordination, and a new AI Analyst that warns you before delays become costly.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link href="/dashboard" className="inline-flex items-center gap-2 rounded-xl bg-sky-400 px-5 py-3 font-semibold text-slate-950 transition hover:bg-sky-300">
                  Open Dashboard <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/ai-analyst" className="inline-flex items-center gap-2 rounded-xl border border-slate-500/80 bg-slate-950/30 px-5 py-3 font-semibold text-slate-100 transition hover:border-slate-300 hover:bg-slate-900/70">
                  Try AI Analyst <BrainCircuit className="h-4 w-4" />
                </Link>
              </div>
            </div>

            <div className="grid gap-4">
              <div className="rounded-2xl border border-slate-700/70 bg-slate-950/40 p-5">
                <div className="flex items-center gap-3">
                  <div className="grid h-11 w-11 place-items-center rounded-xl bg-sky-400/15 text-sky-300">
                    <LineChart className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Live intelligence</p>
                    <h3 className="text-lg font-semibold">Forecasts and reports in one place</h3>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-700/70 bg-slate-950/40 p-5">
                <div className="flex items-center gap-3">
                  <div className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-400/15 text-emerald-300">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Enterprise-ready</p>
                    <h3 className="text-lg font-semibold">Role-based access across teams</h3>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-700/70 bg-slate-950/40 p-5">
                <div className="flex items-center gap-3">
                  <div className="grid h-11 w-11 place-items-center rounded-xl bg-rose-400/15 text-rose-300">
                    <Telescope className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Operational focus</p>
                    <h3 className="text-lg font-semibold">See risk before it impacts delivery</h3>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
