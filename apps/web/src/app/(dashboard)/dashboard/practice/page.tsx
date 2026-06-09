"use client";

import { useState } from "react";
import { Brain, MessageCircle, Puzzle, CheckCircle, ArrowLeft } from "lucide-react";
import { QuizMode } from "@/components/practice/quiz-mode";
import { HangoutMode } from "@/components/practice/hangout-mode";
import { PuzzleMode } from "@/components/practice/puzzle-mode";
import { cn } from "@/lib/utils";

type Mode = "select" | "quiz" | "hangout" | "puzzle";

const MODES = [
  {
    id: "quiz" as Mode,
    icon: <Brain size={24} className="text-primary" />,
    title: "Quiz Me",
    description: "5 questions on a topic of your choice. Test what you know.",
    time: "5–10 min",
    color: "bg-primary-50",
  },
  {
    id: "hangout" as Mode,
    icon: <MessageCircle size={24} className="text-accent" />,
    title: "Let's Hang Out",
    description: "Chat with Clara. No pressure, no score — just a friendly tech conversation.",
    time: "As long as you want",
    color: "bg-accent-light",
  },
  {
    id: "puzzle" as Mode,
    icon: <Puzzle size={24} className="text-success" />,
    title: "Daily Puzzle",
    description: "Solve a coding puzzle, spot a bug, or tackle a logic challenge.",
    time: "5–10 min",
    color: "bg-success-light",
  },
];

export default function PracticePage() {
  const [mode, setMode] = useState<Mode>("select");

  if (mode === "quiz") {
    return (
      <div className="max-w-2xl animate-fade-in">
        <BackButton onBack={() => setMode("select")} />
        <QuizMode onComplete={() => setMode("select")} />
      </div>
    );
  }

  if (mode === "hangout") {
    return (
      <div className="max-w-2xl animate-fade-in">
        <BackButton onBack={() => setMode("select")} />
        <HangoutMode />
      </div>
    );
  }

  if (mode === "puzzle") {
    return (
      <div className="max-w-2xl animate-fade-in">
        <BackButton onBack={() => setMode("select")} />
        <PuzzleMode onComplete={() => setMode("select")} />
      </div>
    );
  }

  return (
    <div className="max-w-2xl animate-fade-in">
      {/* Welcome message */}
      <div className="mb-6">
        <h2 className="font-heading text-xl font-semibold text-text-primary mb-1">
          What do you feel like today?
        </h2>
        <p className="text-sm text-text-muted">
          Even 10 minutes keeps your brain warm and your streak alive 🔥
        </p>
      </div>

      {/* Mode cards */}
      <div className="space-y-3">
        {MODES.map((m) => (
          <button
            key={m.id}
            onClick={() => setMode(m.id)}
            className="card p-5 w-full text-left hover:shadow-card-hover transition-all group flex items-center gap-4"
          >
            <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0", m.color)}>
              {m.icon}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-text-primary group-hover:text-primary transition-colors">
                  {m.title}
                </h3>
                <span className="text-xs text-text-muted">{m.time}</span>
              </div>
              <p className="text-sm text-text-muted mt-0.5">{m.description}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function BackButton({ onBack }: { onBack: () => void }) {
  return (
    <button
      onClick={onBack}
      className="flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary mb-4 transition-colors"
    >
      <ArrowLeft size={15} />
      Back to modes
    </button>
  );
}
