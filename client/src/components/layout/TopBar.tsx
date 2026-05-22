"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import { Search, Globe2, ShieldCheck, Settings, LogOut, FileText, MoreVertical } from "lucide-react";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { useAuthStore } from "@/lib/store";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/ai-analyst", label: "AI Analyst" },
  { href: "/projects", label: "Projects" },
  { href: "/tasks", label: "Tasks" },
  { href: "/reports", label: "Reports" },
  { href: "/team", label: "Team" },
  { href: "/documents", label: "Documents" }
];

export function TopBar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuthStore();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <header className="glass sticky top-3 z-30 mx-auto mt-4 w-[95%] max-w-[1600px] rounded-[1.6rem] border border-slate-700/60 bg-slate-950/70 px-4 py-3 backdrop-blur-2xl md:px-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <div className="grid h-11 w-11 place-items-center overflow-hidden rounded-xl border border-slate-700/60 bg-slate-950/80 shadow-[0_10px_30px_rgba(2,8,23,0.35)]">
            <Image src="/brand-logo.svg" alt="BuildTrack AI logo" width={44} height={44} className="h-full w-full object-cover" priority />
          </div>
          <div className="min-w-0">
            <p className="truncate text-xs uppercase tracking-[0.16em] text-cyan-300">BuildTrack AI</p>
            <h1 className="truncate text-base font-semibold md:text-lg text-slate-100">Enterprise Construction OS</h1>
          </div>
        </div>

        <div className="hidden md:flex flex-wrap items-center gap-2 text-xs text-slate-300">
          <span className="inline-flex items-center gap-2 rounded-full border border-slate-700/60 bg-slate-950/40 px-3 py-1.5 hover:border-cyan-500/40 transition">
            <Globe2 className="h-3.5 w-3.5 text-cyan-300" />
            Global control center
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border border-slate-700/60 bg-slate-950/40 px-3 py-1.5 hover:border-emerald-500/40 transition">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-300" />
            Secure access
          </span>
        </div>

        <nav className="hidden gap-1 rounded-2xl border border-slate-700/60 bg-slate-950/40 p-1.5 text-sm text-slate-300 lg:flex lg:self-end">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-lg px-3 py-1.5 transition ${
                pathname === item.href
                  ? "bg-cyan-500/20 text-cyan-200"
                  : "hover:bg-slate-800/70 hover:text-white"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 lg:self-end">
          <button className="grid h-10 w-10 place-items-center rounded-xl border border-slate-700/60 bg-slate-900/60 text-slate-300 transition hover:border-cyan-500/40 hover:text-white">
            <Search className="h-4 w-4" />
          </button>
          <NotificationBell />
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="grid h-10 w-10 place-items-center rounded-xl border border-slate-700/60 bg-slate-900/60 text-slate-300 transition hover:border-cyan-500/40 hover:text-white"
            >
              <MoreVertical className="h-4 w-4" />
            </button>
            <AnimatePresence>
              {userMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 top-12 w-52 rounded-2xl border border-slate-700/50 bg-slate-900/95 shadow-xl backdrop-blur-2xl z-50"
                >
                  <Link
                    href="/documents"
                    className="flex items-center gap-3 px-4 py-3 text-sm text-slate-300 hover:text-white hover:bg-slate-800/50 transition border-b border-slate-700/30"
                  >
                    <FileText className="h-4 w-4" />
                    Documents
                  </Link>
                  <Link
                    href="/settings"
                    className="flex items-center gap-3 px-4 py-3 text-sm text-slate-300 hover:text-white hover:bg-slate-800/50 transition border-b border-slate-700/30"
                  >
                    <Settings className="h-4 w-4" />
                    Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-300 hover:text-red-200 hover:bg-red-500/10 transition"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 text-xs font-semibold text-white shadow-lg shadow-cyan-500/20">
            U
          </div>
        </div>
      </div>
    </header>
  );
}
