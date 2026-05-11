"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { TopBar } from "@/components/layout/TopBar";
import { useLogin } from "@/hooks/useLogin";
import { Check, AlertCircle, Loader } from "lucide-react";

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
      <section className="mx-auto mt-14 w-[92%] max-w-lg">
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-3xl p-8"
        >
          <h2 className="text-3xl font-semibold">Welcome back</h2>
          <p className="mt-2 text-sm text-slate-400">Securely login to manage site operations.</p>

          {/* Error Message */}
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

          {/* Success Message */}
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

          {/* Email Input */}
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

          {/* Password Input */}
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

          {/* Submit Button */}
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

          {/* Demo Info */}
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
      </section>
    </main>
  );
}
