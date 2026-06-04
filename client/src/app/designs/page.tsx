"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TopBar } from "@/components/layout/TopBar";
import { 
  FolderOpen, 
  Trash2, 
  RefreshCw, 
  Sparkles, 
  ArrowRight, 
  Grid, 
  Compass, 
  DoorClosed, 
  Activity,
  Plus
} from "lucide-react";
import { api } from "@/lib/api";

type Design = { 
  id: string; 
  name: string; 
  createdAt: string;
  data?: {
    walls?: any[];
    openings?: any[];
  }
};

export default function DesignsPage() {
  const [designs, setDesigns] = useState<Design[]>([]);
  const [loading, setLoading] = useState(false);

  async function fetchList() {
    setLoading(true);
    try {
      const response = await api.get("/designs");
      setDesigns(response.data || []);
    } catch (err) {
      console.error(err);
      setDesigns([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchList();
  }, []);

  async function handleLoad(id: string) {
    window.location.href = `/designer?load=${id}`;
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Are you sure you want to delete this design?")) return;
    try {
      await api.delete(`/designs/${id}`);
      setDesigns((d) => d.filter((x) => x.id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete design");
    }
  }

  return (
    <main className="relative overflow-hidden pb-24 min-h-screen text-slate-100">
      {/* Background Graphics */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.14),transparent_30%),radial-gradient(circle_at_70%_20%,rgba(34,197,94,0.08),transparent_20%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.08),transparent_26%),linear-gradient(180deg,rgba(2,6,23,0.96),rgba(2,6,23,1))]" />
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-[0.12]" style={{ backgroundImage: "linear-gradient(rgba(56,189,248,0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(56,189,248,0.18) 1px, transparent 1px)", backgroundSize: "120px 120px" }} />

      <TopBar />

      <section className="mx-auto mt-10 w-[92%] max-w-[1600px] space-y-8">
        {/* Hero Header */}
        <div className="relative overflow-hidden rounded-[2rem] border border-slate-700/60 bg-[linear-gradient(135deg,rgba(2,6,23,0.98),rgba(15,23,42,0.98))] p-8 md:p-10 shadow-[0_40px_100px_rgba(2,8,23,0.5)]">
          <div className="absolute right-0 top-0 -z-10 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" />
          
          <div className="max-w-3xl space-y-4">
            <p className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-xs uppercase tracking-[0.22em] text-cyan-300">
              <Sparkles className="h-3.5 w-3.5" />
              Blueprints & Architectures
            </p>
            <h2 className="text-4xl font-semibold leading-tight tracking-tight text-white md:text-5xl">
              Saved Architectural Designs
            </h2>
            <p className="text-sm text-slate-300 md:text-base">
              Browse, inspect, edit, or delete saved site designs and floor plans. Load any design directly into the interactive 3D plan editor.
            </p>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <button 
              onClick={fetchList}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm font-semibold transition hover:bg-slate-800 hover:border-slate-600 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              {loading ? "Refreshing..." : "Refresh Database"}
            </button>

            <a 
              href="/designer"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-400 to-cyan-300 px-5 py-2.5 text-sm font-semibold text-slate-950 hover:shadow-[0_0_30px_rgba(56,189,248,0.25)] hover:scale-[1.02] active:scale-[0.98] transition duration-200"
            >
              <Plus className="h-4 w-4" />
              New Design
            </a>
          </div>
        </div>

        {/* Designs List Section */}
        <div>
          {loading && designs.length === 0 ? (
            <div className="flex h-64 items-center justify-center rounded-2xl border border-slate-700/50 bg-slate-950/40 backdrop-blur-md">
              <div className="flex flex-col items-center gap-3">
                <RefreshCw className="h-8 w-8 animate-spin text-cyan-400" />
                <p className="text-sm text-slate-400">Loading saved blueprints...</p>
              </div>
            </div>
          ) : designs.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center rounded-2xl border border-slate-700/50 bg-slate-950/40 p-6 text-center backdrop-blur-md">
              <FolderOpen className="h-12 w-12 text-slate-600 mb-3" />
              <p className="font-semibold text-slate-300">No saved designs found</p>
              <p className="text-xs text-slate-500 mt-1 max-w-sm">
                Create a design in the 3D Plan Designer tool and click "Save Design (server)" to save it here.
              </p>
              <a 
                href="/designer"
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-slate-800 border border-slate-700 hover:bg-slate-700 hover:text-white px-4 py-2 text-xs font-semibold transition"
              >
                Go to Designer
              </a>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              <AnimatePresence>
                {designs.map((design) => {
                  const wallsCount = design.data?.walls?.length ?? 0;
                  const openingsCount = design.data?.openings?.length ?? 0;

                  return (
                    <motion.div
                      key={design.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      whileHover={{ y: -4, borderColor: "rgba(56,189,248,0.4)" }}
                      className="group relative flex flex-col justify-between overflow-hidden rounded-[1.6rem] border border-slate-700/50 bg-slate-950/45 p-6 backdrop-blur-xl shadow-xl transition-all duration-300 hover:shadow-[0_15px_40px_rgba(2,8,23,0.4)]"
                    >
                      {/* Top row */}
                      <div className="space-y-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="rounded-xl border border-slate-700/60 bg-slate-900/80 p-3 group-hover:border-cyan-500/30 transition duration-300">
                            <Compass className="h-6 w-6 text-cyan-300" />
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] uppercase tracking-wider text-slate-500 font-mono">ID: {design.id.slice(-6)}</span>
                          </div>
                        </div>

                        <div>
                          <h3 className="text-lg font-semibold text-white group-hover:text-cyan-200 transition duration-300 line-clamp-1">
                            {design.name}
                          </h3>
                          <p className="text-xs text-slate-500 mt-1">
                            Created {new Date(design.createdAt).toLocaleDateString(undefined, { 
                              year: 'numeric', 
                              month: 'short', 
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>

                        {/* Specs Metrics */}
                        <div className="grid grid-cols-2 gap-2 pt-2">
                          <div className="rounded-xl border border-slate-700/40 bg-slate-900/30 px-3 py-2 flex items-center gap-2">
                            <Grid className="h-3.5 w-3.5 text-slate-500" />
                            <div>
                              <p className="text-[10px] uppercase tracking-wider text-slate-500">Walls</p>
                              <p className="text-xs font-semibold text-slate-200">{wallsCount} walls</p>
                            </div>
                          </div>
                          <div className="rounded-xl border border-slate-700/40 bg-slate-900/30 px-3 py-2 flex items-center gap-2">
                            <DoorClosed className="h-3.5 w-3.5 text-slate-500" />
                            <div>
                              <p className="text-[10px] uppercase tracking-wider text-slate-500">Openings</p>
                              <p className="text-xs font-semibold text-slate-200">{openingsCount} items</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Actions footer */}
                      <div className="mt-6 flex items-center gap-3 border-t border-slate-800/80 pt-4">
                        <button
                          onClick={() => handleLoad(design.id)}
                          className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 border border-slate-700/80 hover:bg-slate-800 hover:border-slate-600 px-4 py-2.5 text-xs font-semibold text-slate-200 transition"
                        >
                          Load in 3D Editor
                          <ArrowRight className="h-3 w-3" />
                        </button>
                        
                        <button
                          onClick={() => handleDelete(design.id)}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-red-500/20 bg-red-500/5 text-red-400 hover:bg-red-500/10 hover:text-red-300 transition"
                          title="Delete blueprint"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
