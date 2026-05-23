"use client";

import { TopBar } from "@/components/layout/TopBar";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Project } from "@/lib/types";

const filters = ["ALL", "IN_PROGRESS", "DELAYED", "COMPLETED"] as const;

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<(typeof filters)[number]>("ALL");

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    api
      .get("/projects")
      .then((res: any) => {
        if (mounted) setProjects(res.data.projects || []);
      })
      .catch(() => {
        if (mounted) setProjects([]);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const filteredProjects = projects.filter((project) => {
    const byStatus = statusFilter === "ALL" ? true : project.status === statusFilter;
    const byQuery = [project.title, project.clientName, project.location]
      .join(" ")
      .toLowerCase()
      .includes(query.toLowerCase());

    return byStatus && byQuery;
  });

  const delayedCount = projects.filter((item) => item.status === "DELAYED").length;
  const inProgressCount = projects.filter((item) => item.status === "IN_PROGRESS").length;
  const avgProgress =
    projects.length > 0
      ? Math.round(projects.reduce((sum, project) => sum + project.progressPercentage, 0) / projects.length)
      : 0;

  return (
    <main className="pb-20">
      <TopBar />
      <section className="mx-auto mt-10 w-[92%] max-w-7xl space-y-6">
        <h2 className="text-2xl font-semibold">Projects</h2>
        <p className="mt-1 text-sm text-slate-400">Live project tracking with budget and deadline visibility.</p>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="glass rounded-2xl p-4">
            <p className="text-xs uppercase tracking-wider text-slate-400">In Progress</p>
            <p className="mt-2 text-3xl font-semibold">{inProgressCount}</p>
          </div>
          <div className="glass rounded-2xl p-4">
            <p className="text-xs uppercase tracking-wider text-slate-400">Delayed</p>
            <p className="mt-2 text-3xl font-semibold text-rose-300">{delayedCount}</p>
          </div>
          <div className="glass rounded-2xl p-4">
            <p className="text-xs uppercase tracking-wider text-slate-400">Average Progress</p>
            <p className="mt-2 text-3xl font-semibold text-sky-200">{avgProgress}%</p>
          </div>
        </div>

        <div className="panel flex flex-col gap-3 rounded-2xl p-4 md:flex-row md:items-center md:justify-between">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search project, client, or location"
            className="w-full rounded-xl border border-slate-700/60 bg-slate-950/40 px-4 py-2.5 text-sm outline-none transition focus:border-sky-400 md:max-w-sm"
          />
          <div className="flex flex-wrap gap-2">
            {filters.map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                  statusFilter === status
                    ? "bg-sky-400/20 text-sky-200"
                    : "border border-slate-700/60 bg-slate-900/40 text-slate-300 hover:text-white"
                }`}
              >
                {status.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-700/60">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-900/70 text-slate-300">
              <tr>
                <th className="px-4 py-3">Project</th>
                <th className="px-4 py-3">Client</th>
                <th className="px-4 py-3">Budget</th>
                <th className="px-4 py-3">Progress</th>
                <th className="px-4 py-3">Deadline</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-slate-400">
                    Loading projects...
                  </td>
                </tr>
              ) : (
                filteredProjects.map((project) => (
                  <tr key={project.id} className="border-t border-slate-800 bg-slate-950/40">
                    <td className="px-4 py-3 font-medium">{project.title}</td>
                    <td className="px-4 py-3">{project.clientName}</td>
                    <td className="px-4 py-3">Rs. {Number(project.budget).toLocaleString()}</td>
                    <td className="px-4 py-3">{project.progressPercentage}%</td>
                    <td className="px-4 py-3">{new Date(project.deadline).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-3 py-1 text-xs ${
                          project.status === "DELAYED"
                            ? "bg-rose-400/20 text-rose-300"
                            : project.status === "COMPLETED"
                              ? "bg-emerald-400/20 text-emerald-300"
                              : "bg-sky-400/20 text-sky-300"
                        }`}
                      >
                        {project.status.replace("_", " ")}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
