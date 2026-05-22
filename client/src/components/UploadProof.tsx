"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

export default function UploadProof({ onDone }: { onDone?: (url: string) => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);

  const handle = (f: File | null) => {
    setFile(f);
    if (f) {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(f);
    } else {
      setPreview(null);
    }
  };

  const submit = async () => {
    if (!file) return;
    setUploading(true);
    const form = new FormData();
    form.append("proof", file);

    try {
      const res = await api.post("/uploads/task-proof", form, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (e: { loaded: number; total?: number | null }) => {
          if (e.total) setProgress(Math.round((e.loaded / e.total) * 100));
        }
      });
      const url = res.data.url;
      setUploadedUrl(url);
      onDone?.(url);
      setTimeout(() => {
        setFile(null);
        setPreview(null);
        setUploadedUrl(null);
      }, 3000);
    } catch (err: any) {
      console.error("Upload error:", err);
      alert(err.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) handle(dropped);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-6 border border-slate-700"
    >
      <p className="text-sm font-semibold text-slate-200 mb-4">📸 Upload Proof of Work</p>
      
      <AnimatePresence mode="wait">
        {!uploadedUrl ? (
          <div className="space-y-4">
            <motion.div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-6 transition-all ${
                dragOver ? "border-sky-400 bg-sky-400/10" : "border-slate-600 hover:border-slate-500"
              }`}
            >
              {preview ? (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="relative w-full max-h-48 rounded-lg overflow-hidden"
                >
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-full h-auto object-cover rounded-lg"
                  />
                </motion.div>
              ) : (
                <label className="cursor-pointer text-center">
                  <div className="text-3xl mb-2">📁</div>
                  <p className="text-sm text-slate-300">Drag and drop or click to select</p>
                  <input
                    onChange={(e) => handle(e.target.files?.[0] ?? null)}
                    type="file"
                    accept="image/*,.pdf"
                    className="hidden"
                  />
                </label>
              )}
            </motion.div>

            {file && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between bg-slate-700/50 rounded-lg p-3"
              >
                <span className="text-sm text-slate-300 truncate">{file.name}</span>
                <span className="text-xs text-slate-400">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
              </motion.div>
            )}

            <div className="flex gap-3">
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => handle(null)}
                disabled={!file || uploading}
                className="flex-1 rounded-lg border border-slate-600 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-700 disabled:opacity-50"
              >
                Clear
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={submit}
                disabled={!file || uploading}
                className="flex-1 rounded-lg bg-gradient-to-r from-sky-500 to-blue-500 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
              >
                {uploading ? `Uploading ${progress}%` : "Upload"}
              </motion.button>
            </div>

            {uploading && (
              <motion.div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  className="h-full bg-gradient-to-r from-sky-400 to-blue-400"
                  transition={{ duration: 0.3 }}
                />
              </motion.div>
            )}
          </div>
        ) : (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="text-center py-6"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2 }}
              className="text-4xl mb-2 inline-block"
            >
              ✅
            </motion.div>
            <p className="text-sm font-medium text-green-400">Upload successful!</p>
            <p className="text-xs text-slate-400 mt-1 truncate">{uploadedUrl}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
