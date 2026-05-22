"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { TopBar } from "@/components/layout/TopBar";
import { useLogin } from "@/hooks/useLogin";
import { Check, AlertCircle, Loader, ShieldCheck, Sparkles, TrendingUp, Users } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("admin@buildtrack.ai");
  const [password, setPassword] = useState("BuildTrack@123");
  const [success, setSuccess] = useState(false);
  const { login, loading, error, clearError } = useLogin();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    const result = await login(email, password);
    if (result) {
      setSuccess(true);
    }
  };

  const handleInputChange = () => {
    clearError();
  };

  return (
    <main className="pb-20">
      <TopBar />
      <section className="mx-auto mt-10 w-[92%] max-w-7xl">
        <div className="grid gap-8 overflow-hidden rounded-[2rem] border border-slate-700/60 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.18),transparent_32%),linear-gradient(135deg,rgba(2,6,23,0.98),rgba(15,23,42,0.98))] p-5 shadow-[0_30px_90px_rgba(2,8,23,0.55)] lg:grid-cols-[1.05fr_0.95fr] lg:p-8">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-[1.75rem] border border-slate-700/60 bg-slate-950/50 p-6 lg:p-8"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.20),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(34,197,94,0.15),transparent_26%)]" />
            <div className="relative z-10">
              <p className="inline-flex items-center gap-2 rounded-full border border-sky-400/30 bg-sky-400/10 px-4 py-2 text-xs uppercase tracking-[0.22em] text-sky-300">
                <Sparkles className="h-3.5 w-3.5" />
                Executive Access
              </p>

              <h2 className="mt-6 max-w-xl text-4xl font-bold leading-tight tracking-tight text-white md:text-6xl">
                A sharper way to run construction operations.
              </h2>

              <p className="mt-5 max-w-xl text-base text-slate-300 md:text-lg">
                Sign in to a premium control center designed for project leaders, site engineers, and executive teams.
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-slate-700/70 bg-slate-950/45 p-4">
                  <TrendingUp className="h-5 w-5 text-emerald-300" />
                  <p className="mt-4 text-2xl font-semibold text-white">94%</p>
                  <p className="mt-1 text-sm text-slate-400">Delivery confidence</p>
                </div>
                <div className="rounded-2xl border border-slate-700/70 bg-slate-950/45 p-4">
                  <ShieldCheck className="h-5 w-5 text-sky-300" />
                  <p className="mt-4 text-2xl font-semibold text-white">Role-based</p>
                  <p className="mt-1 text-sm text-slate-400">Secure team access</p>
                </div>
                <div className="rounded-2xl border border-slate-700/70 bg-slate-950/45 p-4">
                  <Users className="h-5 w-5 text-amber-300" />
                  <p className="mt-4 text-2xl font-semibold text-white">Live</p>
                  <p className="mt-1 text-sm text-slate-400">Multi-team coordination</p>
                </div>
              </div>

              <div className="mt-8 overflow-hidden rounded-[1.5rem] border border-slate-700/60 bg-slate-950/45 p-3">
                <Image
                  src="/login-hero.svg"
                  alt="BuildTrack AI dashboard illustration"
                  width={1200}
                  height={1200}
                  className="h-auto w-full rounded-[1.1rem]"
                  priority
                />
              </div>
            </div>
          </motion.div>

          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-[1.75rem] border border-slate-700/60 p-8"
          >
            <h2 className="text-3xl font-semibold">Welcome back</h2>
            <p className="mt-2 text-sm text-slate-400">Securely login to manage site operations.</p>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-6 flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4"
              >
                <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-400" />
                <p className="text-sm text-red-300">{error.message}</p>
              </motion.div>
            )}

            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 flex items-start gap-3 rounded-xl border border-green-500/30 bg-green-500/10 p-4"
              >
                <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-400" />
                <p className="text-sm text-green-300">Login successful! Redirecting...</p>
              </motion.div>
            )}

            <label className={`mt-6 block text-sm ${error?.field === "email" ? "text-red-400" : "text-slate-300"}`}>
              Email
            </label>
            <input
              className={`mt-2 w-full rounded-xl border bg-slate-900/60 px-4 py-3 outline-none transition ${
                error?.field === "email"
                  ? "border-red-500 focus:border-red-400"
                  : "border-slate-600 focus:border-sky-400"
              }`}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                handleInputChange();
              }}
              type="email"
              placeholder="admin@buildtrack.ai"
              disabled={loading || success}
              required
            />

            <label className={`mt-4 block text-sm ${error?.field === "password" ? "text-red-400" : "text-slate-300"}`}>
              Password
            </label>
            <input
              className={`mt-2 w-full rounded-xl border bg-slate-900/60 px-4 py-3 outline-none transition ${
                error?.field === "password"
                  ? "border-red-500 focus:border-red-400"
                  : "border-slate-600 focus:border-sky-400"
              }`}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                handleInputChange();
              }}
              type="password"
              placeholder="••••••••"
              disabled={loading || success}
              required
            />

            <motion.button
              type="submit"
              disabled={loading || success}
              whileHover={!loading && !success ? { scale: 1.02 } : {}}
              whileTap={!loading && !success ? { scale: 0.98 } : {}}
              className={`mt-6 w-full rounded-xl px-4 py-3 font-semibold transition flex items-center justify-center gap-2 ${
                loading || success
                  ? "bg-slate-600 text-slate-300 cursor-not-allowed"
                  : "bg-sky-400 text-slate-900 hover:bg-sky-300"
              }`}
            >
              {loading && <Loader className="h-4 w-4 animate-spin" />}
              {success && <Check className="h-4 w-4" />}
              {loading ? "Logging in..." : success ? "Success!" : "Login"}
            </motion.button>

            <div className="mt-6 rounded-lg border border-slate-700/50 bg-slate-900/30 p-4">
              <p className="text-xs font-medium text-slate-400">Demo Account</p>
              <p className="mt-1 text-xs text-slate-500">
                Email: <span className="font-mono text-slate-400">admin@buildtrack.ai</span>
              </p>
              <p className="text-xs text-slate-500">
                Password: <span className="font-mono text-slate-400">BuildTrack@123</span>
              </p>
            </div>
          </motion.form>
        </div>
      </section>
    </main>
  );
}
