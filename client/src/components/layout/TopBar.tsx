"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Building2, Globe2, Search, ShieldCheck } from "lucide-react";

const nav = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/ai-analyst", label: "AI Analyst" },
  { href: "/projects", label: "Projects" },
  { href: "/tasks", label: "Tasks" },
  { href: "/reports", label: "Reports" },
  { href: "/team", label: "Team" },
  { href: "/login", label: "Login" }
];

export function TopBar() {
  const pathname = usePathname();

  return (
    <header className="glass sticky top-3 z-30 mx-auto mt-4 w-[95%] max-w-7xl rounded-2xl px-4 py-3 md:px-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-sky-400/15 text-sky-300">
            <Building2 className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-xs uppercase tracking-[0.16em] text-sky-300">BuildTrack AI</p>
            <h1 className="truncate text-base font-semibold md:text-lg">Enterprise Construction OS</h1>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300">
          <span className="inline-flex items-center gap-2 rounded-full border border-slate-700/60 bg-slate-950/40 px-3 py-1.5">
            <Globe2 className="h-3.5 w-3.5 text-sky-300" />
            Global control center · UTC+5:30
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border border-slate-700/60 bg-slate-950/40 px-3 py-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-300" />
            Secure executive access
          </span>
        </div>

        <nav className="hidden gap-2 rounded-xl border border-slate-700/60 bg-slate-950/40 p-1.5 text-sm text-slate-300 lg:flex lg:self-end">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-lg px-3 py-1.5 transition ${
                pathname === item.href
                  ? "bg-sky-400/20 text-sky-200"
                  : "hover:bg-slate-800/70 hover:text-white"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 lg:self-end">
          <button className="grid h-9 w-9 place-items-center rounded-lg border border-slate-700/60 bg-slate-900/50 text-slate-300 transition hover:text-white">
            <Search className="h-4 w-4" />
          </button>
          <button className="relative grid h-9 w-9 place-items-center rounded-lg border border-slate-700/60 bg-slate-900/50 text-slate-300 transition hover:text-white">
            <Bell className="h-4 w-4" />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-rose-400" />
          </button>
          <div className="grid h-9 w-9 place-items-center rounded-full border border-sky-400/40 bg-sky-400/10 text-xs font-semibold text-sky-200">
            PM
          </div>
        </div>
      </div>
    </header>
  );
}
