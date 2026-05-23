"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import { TopBar } from "@/components/layout/TopBar";
import { useLogin } from "@/hooks/useLogin";
import { Check, AlertCircle, Loader, ShieldCheck, Sparkles, TrendingUp, Users, LockKeyhole, Workflow, ArrowRight, Globe2 } from "lucide-react";
import { useAuthStore } from "@/lib/store";

export default function LoginPage() {
  const router = useRouter();
  const token = useAuthStore((state) => state.token);
  const [email, setEmail] = useState("admin@buildtrack.ai");
  const [password, setPassword] = useState("BuildTrack@123");
  const [success, setSuccess] = useState(false);
  const { login, loading, error, clearError } = useLogin();

  useEffect(() => {
    if (token) {
      router.replace("/dashboard");
    }
  }, [router, token]);

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
    <main className="relative overflow-hidden pb-24">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.16),transparent_28%),radial-gradient(circle_at_70%_20%,rgba(34,197,94,0.12),transparent_18%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.10),transparent_24%),linear-gradient(180deg,rgba(2,6,23,0.88),rgba(2,6,23,1))]" />

      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.18]"
        animate={{ backgroundPositionY: [0, 120] }}
        transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
        style={{
          backgroundImage:
            "linear-gradient(rgba(56,189,248,0.16) 1px, transparent 1px), linear-gradient(90deg, rgba(56,189,248,0.16) 1px, transparent 1px)",
          backgroundSize: "120px 120px"
        }}
      />

      <motion.div
        aria-hidden
        className="pointer-events-none absolute left-0 top-24 -z-10 h-72 w-72 rounded-full bg-sky-400/12 blur-3xl"
        animate={{ x: [0, 30, 0], y: [0, -12, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        aria-hidden
        className="pointer-events-none absolute right-0 bottom-0 -z-10 h-[26rem] w-[26rem] rounded-full bg-emerald-400/10 blur-3xl"
        animate={{ x: [0, -24, 0], y: [0, 16, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
      />

      <TopBar />
      <section className="mx-auto mt-10 w-[92%] max-w-[1600px]">
        <div className="grid min-h-[calc(100vh-10rem)] overflow-hidden rounded-[2.5rem] border border-slate-700/60 bg-[linear-gradient(135deg,rgba(2,6,23,0.98),rgba(15,23,42,0.98))] shadow-[0_40px_120px_rgba(2,8,23,0.72)] xl:grid-cols-[1.45fr_0.75fr]">
          <motion.section
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative flex min-h-[42rem] flex-col justify-between overflow-hidden p-6 sm:p-8 xl:p-10"
          >
            <div className="absolute inset-0">
              <Image
                src="/construction-hero.svg"
                alt="Construction project hero backdrop"
                fill
                priority
                className="object-cover"
              />
              <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(2,6,23,0.78)_0%,rgba(2,6,23,0.48)_40%,rgba(2,6,23,0.82)_100%),linear-gradient(180deg,rgba(2,6,23,0.20),rgba(2,6,23,0.70))]" />
            </div>

            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.18),transparent_28%),radial-gradient(circle_at_70%_25%,rgba(34,197,94,0.14),transparent_20%),radial-gradient(circle_at_bottom_right,rgba(245,158,11,0.08),transparent_24%)]" />

            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
              className="absolute right-6 top-6 rounded-2xl border border-slate-700/70 bg-slate-950/70 px-4 py-3 shadow-2xl shadow-sky-400/10 backdrop-blur"
            >
              <p className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-sky-300">
                <LockKeyhole className="h-3.5 w-3.5" />
                Secure Access
              </p>
              <p className="mt-2 text-sm font-semibold text-white">Enterprise grade login</p>
            </motion.div>

            <div className="relative z-10 max-w-4xl">
              <div className="flex flex-wrap items-center gap-3 text-sm text-slate-200/90">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-md">
                  <Globe2 className="h-4 w-4 text-sky-300" /> Global control center
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-md">
                  <Workflow className="h-4 w-4 text-emerald-300" /> Live workflow orchestration
                </span>
              </div>

              <h2 className="mt-8 max-w-3xl text-5xl font-semibold leading-[0.95] tracking-tight text-white drop-shadow-[0_0_28px_rgba(56,189,248,0.12)] sm:text-6xl lg:text-7xl">
                Building What
                <span className="block font-[cursive] italic text-sky-100 drop-shadow-[0_0_18px_rgba(56,189,248,0.22)]">Matters</span>
                To You
              </h2>

              <p className="mt-6 max-w-2xl text-base text-slate-200/90 sm:text-lg">
                Sign in to a premium command center built for project leaders, site engineers, and executive teams who need live clarity across every site.
              </p>

              <div className="mt-8 flex items-center gap-3 text-sm font-medium uppercase tracking-[0.22em] text-white/85">
                <span>What do you want to build?</span>
                <span className="h-px w-20 bg-gradient-to-r from-sky-300 to-transparent" />
              </div>

              <div className="mt-8 grid gap-4 md:grid-cols-3">
                <div className="rounded-[1.5rem] border border-white/10 bg-white/8 p-4 backdrop-blur-md">
                  <TrendingUp className="h-5 w-5 text-sky-300" />
                  <p className="mt-4 text-3xl font-semibold text-white">94%</p>
                  <p className="mt-1 text-sm text-slate-300">Delivery confidence</p>
                </div>
                <div className="rounded-[1.5rem] border border-white/10 bg-white/8 p-4 backdrop-blur-md">
                  <ShieldCheck className="h-5 w-5 text-emerald-300" />
                  <p className="mt-4 text-3xl font-semibold text-white">Role-based</p>
                  <p className="mt-1 text-sm text-slate-300">Secure team access</p>
                </div>
                <div className="rounded-[1.5rem] border border-white/10 bg-white/8 p-4 backdrop-blur-md">
                  <Users className="h-5 w-5 text-amber-300" />
                  <p className="mt-4 text-3xl font-semibold text-white">Live</p>
                  <p className="mt-1 text-sm text-slate-300">Multi-team coordination</p>
                </div>
              </div>
            </div>
          </motion.section>

          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative flex flex-col justify-center border-t border-slate-700/60 bg-slate-950/78 p-6 backdrop-blur-2xl xl:border-l xl:border-t-0 xl:p-10"
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-3xl font-semibold text-white">Welcome back</h2>
                <p className="mt-2 text-sm text-slate-400">Securely login to manage site operations.</p>
              </div>
              <div className="hidden rounded-2xl border border-slate-700/60 bg-slate-950/50 px-4 py-3 text-right md:block">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Enterprise access</p>
                <p className="mt-1 text-sm font-semibold text-white">Built for leaders</p>
              </div>
            </div>

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
              className={`mt-6 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 font-semibold transition ${
                loading || success
                  ? "cursor-not-allowed bg-slate-600 text-slate-300"
                  : "bg-gradient-to-r from-sky-400 to-cyan-300 text-slate-950 hover:shadow-[0_0_30px_rgba(56,189,248,0.25)]"
              }`}
            >
              {loading && <Loader className="h-4 w-4 animate-spin" />}
              {success && <Check className="h-4 w-4" />}
              {loading ? "Logging in..." : success ? "Success!" : "Enter Control Center"}
              {!loading && !success && <ArrowRight className="h-4 w-4" />}
            </motion.button>

            <div className="mt-6 rounded-2xl border border-slate-700/50 bg-slate-900/45 p-4 backdrop-blur-xl">
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
