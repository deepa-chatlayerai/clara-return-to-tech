"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";
import { Code, Bug, Lightbulb, Loader2, Eye, EyeOff, CheckCircle } from "lucide-react";

interface Puzzle {
  type: string;
  title: string;
  description: string;
  starterCode?: string;
  buggyCode?: string;
  fixedCode?: string;
  solution?: string;
  hint?: string;
  answer?: string;
  explanation: string;
  difficulty: string;
}

interface PuzzleModeProps {
  onComplete: () => void;
}

const TYPES = [
  { id: "code", label: "Code Challenge", icon: <Code size={16} />, color: "bg-primary-50 text-primary" },
  { id: "debug", label: "Spot the Bug", icon: <Bug size={16} />, color: "bg-danger-light text-danger" },
  { id: "logic", label: "Logic Puzzle", icon: <Lightbulb size={16} />, color: "bg-warning-light text-warning" },
];

export function PuzzleMode({ onComplete }: PuzzleModeProps) {
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null);
  const [loading, setLoading] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [completed, setCompleted] = useState(false);

  async function loadPuzzle(type: string) {
    setLoading(true);
    setPuzzle(null);
    setShowHint(false);
    setShowSolution(false);
    setCompleted(false);

    try {
      const res = await fetch("/api/practice/puzzle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setPuzzle(data);
    } catch {
      toast.error("Couldn't generate puzzle — try again");
    } finally {
      setLoading(false);
    }
  }

  function handleComplete() {
    setCompleted(true);
    fetch("/api/practice/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "PUZZLE", topic: puzzle?.type, score: 100 }),
    });
    toast.success("Puzzle complete! Streak updated 🔥");
  }

  // Type selection
  if (!puzzle && !loading) {
    return (
      <div className="card p-6">
        <h3 className="font-heading text-lg font-semibold mb-2">Daily Puzzle 🧩</h3>
        <p className="text-sm text-text-muted mb-5">
          Pick your challenge. Each one takes 5–10 minutes.
        </p>
        <div className="space-y-2">
          {TYPES.map((t) => (
            <button
              key={t.id}
              onClick={() => loadPuzzle(t.id)}
              className="card p-4 w-full text-left hover:shadow-card-hover transition-all flex items-center gap-3 group"
            >
              <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center", t.color)}>
                {t.icon}
              </div>
              <span className="font-medium text-sm text-text-primary group-hover:text-primary transition-colors">
                {t.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="card p-8 text-center">
        <Loader2 size={24} className="animate-spin text-primary mx-auto mb-3" />
        <p className="text-sm text-text-muted">Generating your puzzle…</p>
      </div>
    );
  }

  if (!puzzle) return null;

  return (
    <div className="card p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-text-primary">{puzzle.title}</h3>
          <span className={cn(
            "text-[11px] px-2 py-0.5 rounded-full font-medium",
            puzzle.difficulty === "easy" ? "bg-success-light text-success" : "bg-warning-light text-warning"
          )}>
            {puzzle.difficulty}
          </span>
        </div>
        {completed && <CheckCircle size={20} className="text-success" />}
      </div>

      {/* Description */}
      <p className="text-sm text-text-primary leading-relaxed mb-4">
        {puzzle.description}
      </p>

      {/* Code block (for code/debug types) */}
      {(puzzle.starterCode || puzzle.buggyCode) && (
        <pre className="bg-[#1C1917] text-green-300 rounded-lg p-4 text-xs overflow-x-auto mb-4 font-mono leading-relaxed">
          <code>{puzzle.buggyCode || puzzle.starterCode}</code>
        </pre>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 flex-wrap mb-4">
        {puzzle.hint && (
          <button
            onClick={() => setShowHint(!showHint)}
            className="flex items-center gap-1.5 text-xs btn-ghost border border-border"
          >
            {showHint ? <EyeOff size={13} /> : <Eye size={13} />}
            {showHint ? "Hide hint" : "Show hint"}
          </button>
        )}
        <button
          onClick={() => setShowSolution(!showSolution)}
          className="flex items-center gap-1.5 text-xs btn-ghost border border-border"
        >
          {showSolution ? <EyeOff size={13} /> : <Eye size={13} />}
          {showSolution ? "Hide solution" : "Show solution"}
        </button>
        {!completed && (
          <button onClick={handleComplete} className="btn-primary text-xs ml-auto">
            Mark as solved ✓
          </button>
        )}
      </div>

      {/* Hint */}
      {showHint && puzzle.hint && (
        <div className="bg-warning-light text-warning rounded-lg p-3 text-xs mb-3">
          💡 {puzzle.hint}
        </div>
      )}

      {/* Solution */}
      {showSolution && (
        <div className="space-y-3">
          {(puzzle.fixedCode || puzzle.solution || puzzle.answer) && (
            <pre className="bg-[#1C1917] text-blue-300 rounded-lg p-4 text-xs overflow-x-auto font-mono leading-relaxed">
              <code>{puzzle.fixedCode || puzzle.solution || puzzle.answer}</code>
            </pre>
          )}
          <div className="bg-primary-50 rounded-lg p-3 text-xs text-primary">
            {puzzle.explanation}
          </div>
        </div>
      )}

      {/* Try another */}
      {completed && (
        <div className="flex gap-3 mt-4 pt-4 border-t border-border">
          <button
            onClick={() => loadPuzzle(puzzle.type)}
            className="btn-secondary text-sm"
          >
            Another one
          </button>
          <button onClick={onComplete} className="btn-ghost text-sm">
            Done for today
          </button>
        </div>
      )}
    </div>
  );
}
