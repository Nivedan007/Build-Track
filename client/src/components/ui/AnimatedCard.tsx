"use client";

import { motion } from "framer-motion";

export function AnimatedCard({
  title,
  value,
  subtitle
}: {
  title: string;
  value: string;
  subtitle: string;
}) {
  return (
    <motion.div
      initial={{ y: 28, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.45 }}
      className="glass rounded-2xl border border-slate-700/60 bg-slate-950/60 p-5 shadow-[0_18px_50px_rgba(2,8,23,0.35)] backdrop-blur-2xl"
    >
      <p className="text-sm text-slate-400">{title}</p>
      <h3 className="mt-2 text-3xl font-semibold text-white">{value}</h3>
      <p className="mt-3 text-xs uppercase tracking-wider text-sky-300">{subtitle}</p>
    </motion.div>
  );
}
