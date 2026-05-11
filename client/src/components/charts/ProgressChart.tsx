"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { statusSplit, weeklyProgress } from "@/lib/mock";

export function ProgressChart() {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="glass rounded-2xl p-4">
        <h3 className="mb-4 text-lg font-semibold">Progress vs Budget</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyProgress}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="week" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip />
              <Legend />
              <Bar dataKey="progress" fill="#37bdf8" radius={[6, 6, 0, 0]} />
              <Bar dataKey="budget" fill="#f59e0b" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="glass rounded-2xl p-4">
        <h3 className="mb-4 text-lg font-semibold">Project Status Split</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={statusSplit} dataKey="value" nameKey="name" outerRadius={110} fill="#4ade80" label />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
