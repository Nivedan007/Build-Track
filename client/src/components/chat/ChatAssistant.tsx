"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bot, MessageSquarePlus, Sparkles, Send, X } from "lucide-react";
import { api } from "@/lib/api";
import { useAuthStore } from "@/lib/store";

interface ChatMessage {
  id: string;
  role: "assistant" | "user";
  content: string;
  hint?: string;
}

const starterPrompts = [
  "Show delayed projects",
  "Summarize current team load",
  "What is the budget status?",
  "Explain the AI Analyst result"
];

export function ChatAssistant() {
  const token = useAuthStore((state) => state.token);
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hello. I’m BuildTrack Assistant. Ask me about projects, tasks, reports, team utilization, login roles, or AI delay forecasts.",
      hint: "Try one of the quick prompts to get started."
    }
  ]);
  const listRef = useRef<HTMLDivElement | null>(null);

  const canChat = Boolean(token);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open]);

  const quickPrompts = useMemo(() => starterPrompts, []);

  const sendMessage = async (content?: string) => {
    const text = (content ?? input).trim();
    if (!text || loading) return;

    const userMessage: ChatMessage = {
      id: `${Date.now()}-user`,
      role: "user",
      content: text
    };

    setMessages((current) => [...current, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await api.post("/assistant/chat", { message: text });
      const data = response.data;
      const assistantMessage: ChatMessage = {
        id: `${Date.now()}-assistant`,
        role: "assistant",
        content: data.answer || "I’m ready to help.",
        hint: data.followUp
      };
      setMessages((current) => [...current, assistantMessage]);
    } catch (error: any) {
      setMessages((current) => [
        ...current,
        {
          id: `${Date.now()}-error`,
          role: "assistant",
          content: error.response?.data?.message || "I couldn’t reach the assistant service right now. Please try again."
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 inline-flex items-center gap-3 rounded-full border border-sky-400/30 bg-slate-950/80 px-4 py-3 text-sm font-semibold text-sky-100 shadow-2xl shadow-sky-400/10 backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-sky-300/50 hover:bg-slate-900/90"
      >
        <span className="grid h-9 w-9 place-items-center rounded-full bg-sky-400/15 text-sky-300">
          <Bot className="h-4 w-4" />
        </span>
        <span className="hidden sm:inline">BuildTrack Assistant</span>
        <Sparkles className="h-4 w-4 text-emerald-300" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          >
            <motion.aside
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 24 }}
              transition={{ type: "spring", stiffness: 280, damping: 28 }}
              className="absolute bottom-4 right-4 top-4 flex w-[92vw] max-w-md flex-col overflow-hidden rounded-[2rem] border border-slate-700/70 bg-[linear-gradient(180deg,rgba(15,23,42,0.98),rgba(2,6,23,0.98))] shadow-[0_30px_90px_rgba(2,8,23,0.65)]"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-slate-700/60 px-5 py-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-sky-300">Enterprise AI Assistant</p>
                  <h3 className="text-lg font-semibold text-white">Always-on construction concierge</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="grid h-9 w-9 place-items-center rounded-full border border-slate-700/70 bg-slate-900/60 text-slate-300 transition hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {!canChat ? (
                <div className="flex flex-1 items-center justify-center px-6 text-center text-sm text-slate-300">
                  Please log in to use the assistant.
                </div>
              ) : (
                <>
                  <div ref={listRef} className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
                    {messages.map((message) => (
                      <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                        <div
                          className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-lg ${
                            message.role === "user"
                              ? "bg-sky-400 text-slate-950"
                              : "border border-slate-700/60 bg-slate-900/65 text-slate-100"
                          }`}
                        >
                          <p>{message.content}</p>
                          {message.hint && <p className="mt-2 text-xs text-slate-300/80">{message.hint}</p>}
                        </div>
                      </div>
                    ))}
                    {loading && (
                      <div className="flex justify-start">
                        <div className="rounded-2xl border border-slate-700/60 bg-slate-900/65 px-4 py-3 text-sm text-slate-300">
                          Thinking...
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="border-t border-slate-700/60 px-5 py-4">
                    <div className="mb-3 flex flex-wrap gap-2">
                      {quickPrompts.map((prompt) => (
                        <button
                          key={prompt}
                          type="button"
                          onClick={() => sendMessage(prompt)}
                          className="rounded-full border border-slate-700/60 bg-slate-950/50 px-3 py-1.5 text-xs text-slate-200 transition hover:border-sky-300/50 hover:text-white"
                        >
                          {prompt}
                        </button>
                      ))}
                    </div>

                    <div className="flex items-end gap-3 rounded-2xl border border-slate-700/70 bg-slate-950/45 p-3">
                      <MessageSquarePlus className="mb-1 h-4 w-4 text-sky-300" />
                      <textarea
                        value={input}
                        onChange={(event) => setInput(event.target.value)}
                        placeholder="Ask anything about projects, tasks, reports, team, or AI forecasts..."
                        rows={2}
                        className="min-h-[44px] flex-1 resize-none bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
                      />
                      <button
                        type="button"
                        onClick={() => sendMessage()}
                        disabled={loading || !input.trim()}
                        className="grid h-10 w-10 place-items-center rounded-xl bg-sky-400 text-slate-950 transition hover:bg-sky-300 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <Send className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </>
              )}
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
