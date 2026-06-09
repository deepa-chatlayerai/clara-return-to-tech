"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export function HangoutMode() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage(text?: string) {
    const content = text || input.trim();
    if (!content || loading) return;

    const newMessages: Message[] = [
      ...messages,
      { role: "user", content },
    ];
    setMessages(newMessages);
    setInput("");
    setLoading(true);
    setStarted(true);

    try {
      const res = await fetch("/api/practice/hangout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setMessages([...newMessages, { role: "assistant", content: data.reply }]);

      // Record activity after a few messages
      if (newMessages.length >= 4) {
        fetch("/api/practice/complete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "HANG_OUT", durationMin: 5 }),
        });
      }
    } catch {
      toast.error("Clara couldn't respond — try again");
    } finally {
      setLoading(false);
    }
  }

  const starters = [
    "What's something useful I should learn this week?",
    "Can you explain async/await like I'm 10?",
    "I'm feeling behind — any encouragement?",
    "Tell me about something cool in tech right now",
  ];

  return (
    <div className="card flex flex-col" style={{ height: "70vh" }}>
      {/* Header */}
      <div className="p-4 border-b border-border flex-shrink-0">
        <h3 className="font-semibold text-text-primary flex items-center gap-2">
          💬 Let's Hang Out
        </h3>
        <p className="text-xs text-text-muted mt-0.5">
          No pressure, no scores. Just a friendly chat to keep your brain warm.
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {!started && (
          <div className="text-center py-8">
            <div className="text-3xl mb-3">👋</div>
            <p className="text-sm text-text-muted mb-4">
              Hey! I'm Clara. Ask me anything or pick a conversation starter:
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {starters.map((s) => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="text-xs px-3 py-2 rounded-full border border-border text-text-muted hover:border-primary hover:text-primary transition-all"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div
            key={i}
            className={cn(
              "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
              m.role === "user"
                ? "ml-auto bg-primary text-white rounded-br-sm"
                : "bg-background text-text-primary rounded-bl-sm border border-border"
            )}
          >
            {m.content}
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-xs text-text-muted">
            <Loader2 size={13} className="animate-spin" />
            Clara is typing…
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-border flex-shrink-0">
        <div className="flex gap-2">
          <input
            className="input flex-1"
            placeholder="Type something…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            disabled={loading}
          />
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
            className="btn-primary px-3"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
