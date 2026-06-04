"use client";

import { useEffect, useRef, useState } from "react";
import { FileText, Upload, Download, Trash2, Search, Filter, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { useAuthStore } from "@/lib/store";
import { useNotifications } from "@/lib/notifications";

interface Document {
  id: string;
  name: string;
  type: "report" | "contract" | "invoice" | "spec" | "other";
  size: string;
  date: string;
  url?: string;
}

const mockDocuments: Document[] = [
  {
    id: "1",
    name: "Q1 2026 Construction Report",
    type: "report",
    size: "2.4 MB",
    date: "2026-05-12"
  },
  {
    id: "2",
    name: "Project Contract - BuildTrack",
    type: "contract",
    size: "1.2 MB",
    date: "2026-05-10"
  },
  {
    id: "3",
    name: "Invoice #INV-2026-045",
    type: "invoice",
    size: "456 KB",
    date: "2026-05-08"
  },
  {
    id: "4",
    name: "Technical Specifications",
    type: "spec",
    size: "3.1 MB",
    date: "2026-05-05"
  }
];

const typeColors = {
  report: "bg-blue-500/10 text-blue-300",
  contract: "bg-purple-500/10 text-purple-300",
  invoice: "bg-emerald-500/10 text-emerald-300",
  spec: "bg-orange-500/10 text-orange-300",
  other: "bg-slate-500/10 text-slate-300"
};

const DOCUMENTS_KEY = "buildtrack-documents";

export default function DocumentsPage() {
  const token = useAuthStore((state) => state.token);
  const { addNotification } = useNotifications();
  const [documents, setDocuments] = useState<Document[]>(mockDocuments);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(DOCUMENTS_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        setDocuments(parsed);
      }
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(DOCUMENTS_KEY, JSON.stringify(documents));
    } catch (error) {
      console.error(error);
    }
  }, [documents]);

  if (!token) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-slate-300">Please log in to view documents</p>
      </div>
    );
  }

  const filteredDocs = documents.filter((doc) => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = !filterType || doc.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const handleDelete = (id: string) => {
    setDocuments((current) => current.filter((d) => d.id !== id));
    addNotification({
      type: "success",
      title: "Document deleted",
      message: "Document has been removed"
    });
  };

  const handleUpload = () => {
    fileInputRef.current?.click();
  };

  const onFileSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const nextDoc: Document = {
      id: `${Date.now()}`,
      name: file.name,
      type: file.type.includes("pdf") ? "contract" : file.type.startsWith("image/") ? "spec" : "other",
      size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
      date: new Date().toISOString().slice(0, 10),
      url: URL.createObjectURL(file)
    };

    setDocuments((current) => [nextDoc, ...current]);
    addNotification({
      type: "success",
      title: "Document uploaded",
      message: `${file.name} was added successfully`
    });

    event.target.value = "";
  };

  const handleDownload = (doc: Document) => {
    if (doc.url) {
      const link = document.createElement("a");
      link.href = doc.url;
      link.download = doc.name;
      link.click();
      return;
    }

    const blob = new Blob([`BuildTrack document: ${doc.name}`], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${doc.name}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-mesh fade-grid">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-slate-50">Documents</h1>
              <p className="text-slate-400 mt-2">Manage and share project documentation</p>
            </div>
            <button
              onClick={handleUpload}
              className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-cyan-500/20 transition"
            >
              <Plus className="h-5 w-5" />
              Upload Document
            </button>
            <input ref={fileInputRef} type="file" className="hidden" onChange={onFileSelected} />
          </div>

          {/* Search and Filter */}
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-base w-full pl-10"
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-lg hover:bg-slate-700/50 transition">
              <Filter className="h-5 w-5 text-slate-300" />
              <span className="text-slate-300">Filter</span>
            </button>
          </div>

          {/* Documents Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDocs.length > 0 ? (
              filteredDocs.map((doc) => (
                <motion.div
                  key={doc.id}
                  whileHover={{ y: -4 }}
                  className="card-gradient group cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-lg ${typeColors[doc.type]}`}>
                      <FileText className="h-5 w-5" />
                    </div>
                    <button
                      onClick={() => handleDelete(doc.id)}
                      className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-500/10 rounded-lg transition text-red-300"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="font-semibold text-slate-100 line-clamp-2">{doc.name}</p>
                  <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
                    <span>{doc.size}</span>
                    <span>{new Date(doc.date).toLocaleDateString()}</span>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <button
                      className="flex-1 flex items-center justify-center gap-1 py-2 bg-slate-900/50 hover:bg-slate-800/50 rounded transition text-slate-300 text-sm"
                      onClick={() => handleDownload(doc)}
                    >
                      <Download className="h-4 w-4" />
                      Download
                    </button>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <FileText className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400">No documents found</p>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Total Documents", value: documents.length, icon: FileText },
              { label: "Total Size", value: "12.1 GB", icon: Download },
              { label: "Last Upload", value: "Today", icon: Upload }
            ].map((stat, i) => (
              <motion.div key={i} className="metric-card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">{stat.label}</p>
                    <p className="text-2xl font-bold text-slate-100 mt-2">{stat.value}</p>
                  </div>
                  <stat.icon className="h-8 w-8 text-cyan-400/40" />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
