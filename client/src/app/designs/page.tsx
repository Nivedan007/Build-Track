"use client";
import React, { useEffect, useState } from "react";

type Design = { id: string; name: string; createdAt: string };

export default function DesignsPage() {
  const [designs, setDesigns] = useState<Design[]>([]);
  const [loading, setLoading] = useState(false);

  async function fetchList() {
    setLoading(true);
    try {
      const res = await fetch("/api/designs");
      if (!res.ok) throw new Error("Failed to fetch");
      const json = await res.json();
      setDesigns(json || []);
    } catch (err) {
      console.error(err);
      alert("Failed to load designs");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchList(); }, []);

  async function handleLoad(id: string) {
    // navigate to designer with prompt
    window.location.href = `/designer?load=${id}`;
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Delete this design?")) return;
    try {
      const res = await fetch(`/api/designs/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      setDesigns((d) => d.filter((x) => x.id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete");
    }
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Saved Designs</h2>
      <div className="mb-4">
        <button className="px-3 py-2 bg-slate-200" onClick={fetchList}>{loading ? "Refreshing..." : "Refresh"}</button>
      </div>
      <div>
        {designs.length === 0 ? <div>No designs found.</div> : (
          <ul className="space-y-2">
            {designs.map((d) => (
              <li key={d.id} className="p-3 border rounded flex justify-between items-center">
                <div>
                  <div className="font-medium">{d.name}</div>
                  <div className="text-xs text-slate-500">{new Date(d.createdAt).toLocaleString()}</div>
                </div>
                <div className="space-x-2">
                  <button className="px-2 py-1 bg-emerald-500 text-white" onClick={() => handleLoad(d.id)}>Load</button>
                  <button className="px-2 py-1 bg-red-500 text-white" onClick={() => handleDelete(d.id)}>Delete</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
