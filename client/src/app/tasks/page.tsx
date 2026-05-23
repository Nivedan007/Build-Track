"use client";

import { TopBar } from "@/components/layout/TopBar";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import Notifications from "@/components/Notifications";
import UploadProof from "@/components/UploadProof";

const filters = ["ALL", "PENDING", "IN_PROGRESS", "COMPLETED", "DELAYED"] as const;

export default function TasksPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<(typeof filters)[number]>("ALL");

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    api
      .get("/tasks")
      .then((res: any) => {
        if (mounted) setTasks(res.data.tasks || []);
      })
      .catch(() => {
        if (mounted) setTasks([]);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const filteredTasks = tasks.filter((task) => {
    const byStatus = statusFilter === "ALL" ? true : task.status === statusFilter;
    const byQuery = `${task.title} ${task.assignee?.name ?? ""}`.toLowerCase().includes(query.toLowerCase());
    return byStatus && byQuery;
  });

  const dueSoonCount = tasks.filter((task) => {
    const due = new Date(task.dueDate).getTime();
    const now = Date.now();
    const inThreeDays = now + 3 * 24 * 60 * 60 * 1000;
    return due >= now && due <= inThreeDays;
  }).length;

  const delayedCount = tasks.filter((task) => task.status === "DELAYED").length;
  const completedCount = tasks.filter((task) => task.status === "COMPLETED").length;

  return (
    <main className="pb-20">
      <TopBar />
      <Notifications />
      <section className="mx-auto mt-10 w-[92%] max-w-7xl space-y-6">
        <h2 className="text-2xl font-semibold">Task Management</h2>
        <p className="mt-1 text-sm text-slate-400">Assign, monitor, and close site tasks effectively.</p>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="glass rounded-2xl p-4">
            <p className="text-xs uppercase tracking-wider text-slate-400">Due in 72 hours</p>
            <p className="mt-2 text-3xl font-semibold text-amber-200">{dueSoonCount}</p>
          </div>
          <div className="glass rounded-2xl p-4">
            <p className="text-xs uppercase tracking-wider text-slate-400">Delayed</p>
            <p className="mt-2 text-3xl font-semibold text-rose-300">{delayedCount}</p>
          </div>
          <div className="glass rounded-2xl p-4">
            <p className="text-xs uppercase tracking-wider text-slate-400">Completed</p>
            <p className="mt-2 text-3xl font-semibold text-emerald-300">{completedCount}</p>
          </div>
        </div>

        <div className="panel flex flex-col gap-3 rounded-2xl p-4 md:flex-row md:items-center md:justify-between">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search task or assignee"
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

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {loading ? (
            <div className="text-slate-400">Loading tasks...</div>
          ) : (
            filteredTasks.map((task) => (
              <article key={task.id} className="glass rounded-2xl p-5">
                <p className="text-xs uppercase tracking-wider text-slate-400">Task {task.id}</p>
                <h3 className="mt-2 text-lg font-semibold">{task.title}</h3>
                <p className="mt-3 text-sm text-slate-300">Assigned: {task.assignee?.name ?? "-"}</p>
                <p className="mt-1 text-sm text-slate-300">Priority: {task.priority}</p>
                <p className="mt-1 text-sm text-slate-300">Due: {new Date(task.dueDate).toLocaleDateString()}</p>
                <span
                  className={`mt-4 inline-block rounded-full px-3 py-1 text-xs ${
                    task.status === "DELAYED"
                      ? "bg-rose-400/20 text-rose-300"
                      : task.status === "COMPLETED"
                        ? "bg-emerald-400/20 text-emerald-300"
                        : "bg-sky-400/20 text-sky-300"
                  }`}
                >
                  {task.status.replace("_", " ")}
                </span>
                <div className="mt-4">
                  <UploadProof onDone={(url) => alert(`Proof uploaded: ${url}`)} />
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    </main>
  );
}
