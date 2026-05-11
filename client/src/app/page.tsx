import Link from "next/link";
import { TopBar } from "@/components/layout/TopBar";

export default function HomePage() {
  return (
    <main className="pb-20">
      <TopBar />
      <section className="mx-auto mt-14 w-[92%] max-w-7xl">
        <div className="grid gap-8 rounded-3xl border border-slate-700/60 bg-gradient-to-br from-sky-500/10 to-rose-400/10 p-10 lg:grid-cols-2">
          <div>
            <p className="mb-3 inline-block rounded-full bg-sky-400/20 px-3 py-1 text-xs uppercase tracking-wider text-sky-300">
              AI + Construction Ops
            </p>
            <h2 className="text-4xl font-bold leading-tight md:text-5xl">
              Bring clarity to every construction site in real time.
            </h2>
            <p className="mt-4 max-w-xl text-slate-300">
              Track projects, predict delays, automate reports, and keep clients informed with one intelligent platform.
            </p>
            <div className="mt-7 flex flex-wrap gap-4">
              <Link href="/dashboard" className="rounded-xl bg-sky-400 px-5 py-3 font-semibold text-slate-900 transition hover:bg-sky-300">
                Open Dashboard
              </Link>
              <Link href="/projects" className="rounded-xl border border-slate-500 px-5 py-3 font-semibold text-slate-100 transition hover:border-slate-300">
                View Projects
              </Link>
            </div>
          </div>
          <div className="glass rounded-2xl p-6">
            <h3 className="text-lg font-semibold">What you get</h3>
            <ul className="mt-4 space-y-3 text-sm text-slate-300">
              <li>- Role-based platform for Admin, PM, Engineer, Client, Worker</li>
              <li>- Delay prediction from weather, attendance, material and progress signals</li>
              <li>- Real-time updates using sockets with live dashboard metrics</li>
              <li>- Weekly report-ready analytics widgets and visualizations</li>
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
}
