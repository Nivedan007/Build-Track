"use client";

import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { motion, AnimatePresence } from "framer-motion";
import { isDemoMode } from "@/lib/api";

type Notice = { id: string; text: string; type: "success" | "info" | "warning" | "error" };

export default function Notifications() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [notices, setNotices] = useState<Notice[]>([]);

  useEffect(() => {
    if (isDemoMode) {
      return;
    }

    const s = io(process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5001", {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5
    });
    setSocket(s);

    s.on("connect", () => {
      console.log("Socket connected:", s.id);
    });

    s.on("project:update", (payload: any) => {
      const id = String(Date.now());
      const text = payload.message || `Project update: ${payload.action}`;
      setNotices((n) => [{ id, text, type: "success" }, ...n]);
      setTimeout(() => {
        setNotices((n) => n.filter((x) => x.id !== id));
      }, 5000);
    });

    s.on("error", (error: any) => {
      const id = String(Date.now());
      setNotices((n) => [{ id, text: error.message || "An error occurred", type: "error" }, ...n]);
      setTimeout(() => {
        setNotices((n) => n.filter((x) => x.id !== id));
      }, 7000);
    });

    return () => {
      s.disconnect();
    };
  }, []);

  const getIcon = (type: Notice["type"]) => {
    switch (type) {
      case "success":
        return "✓";
      case "error":
        return "✕";
      case "warning":
        return "!";
      case "info":
      default:
        return "ℹ";
    }
  };

  const getColors = (type: Notice["type"]) => {
    switch (type) {
      case "success":
        return "bg-green-50 border-green-200 text-green-900";
      case "error":
        return "bg-red-50 border-red-200 text-red-900";
      case "warning":
        return "bg-yellow-50 border-yellow-200 text-yellow-900";
      case "info":
      default:
        return "bg-blue-50 border-blue-200 text-blue-900";
    }
  };

  const getIconColors = (type: Notice["type"]) => {
    switch (type) {
      case "success":
        return "bg-green-100 text-green-600";
      case "error":
        return "bg-red-100 text-red-600";
      case "warning":
        return "bg-yellow-100 text-yellow-600";
      case "info":
      default:
        return "bg-blue-100 text-blue-600";
    }
  };

  return (
    <div className="fixed right-6 top-20 z-50 flex flex-col gap-3 pointer-events-none">
      <AnimatePresence>
        {notices.map((n) => (
          <motion.div
            key={n.id}
            initial={{ x: 400, opacity: 0, scale: 0.8 }}
            animate={{ x: 0, opacity: 1, scale: 1 }}
            exit={{ x: 400, opacity: 0, scale: 0.8 }}
            transition={{ type: "spring", stiffness: 350, damping: 30 }}
            className={`${getColors(n.type)} border rounded-lg shadow-lg backdrop-blur-sm pointer-events-auto overflow-hidden`}
          >
            <div className="flex items-start gap-3 p-4">
              <motion.div
                className={`${getIconColors(n.type)} w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-lg`}
                initial={{ rotate: -20 }}
                animate={{ rotate: 0 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                {getIcon(n.type)}
              </motion.div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium break-words">{n.text}</p>
              </div>
            </div>
            <motion.div
              className="h-1 bg-gradient-to-r from-transparent via-current to-transparent opacity-20"
              initial={{ scaleX: 1 }}
              animate={{ scaleX: 0 }}
              transition={{ duration: 5, ease: "linear" }}
              style={{ transformOrigin: "right" }}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
