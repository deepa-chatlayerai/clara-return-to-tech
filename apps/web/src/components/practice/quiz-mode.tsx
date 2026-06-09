"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";
import { CheckCircle, XCircle, Sparkles, Loader2 } from "lucide-react";

interface Question {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

interface QuizModeProps {
  onComplete: () => void;
}

export function QuizMode({ onComplete }: QuizModeProps) {
  const [topic, setTopic] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [loading, setLoading] = useState(false);

  async function startQuiz() {
    setLoading(true);
    try {
      const res = await fetch("/api/practice/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: topic || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setQuestions(data.questions);
      setCurrent(0);
      setScore(0);
      setFinished(false);
    } catch {
      toast.error("Couldn't generate quiz — try again");
    } finally {
      setLoading(false);
    }
  }

  function handleSelect(index: number) {
    if (revealed) return;
    setSelected(index);
  }

  function handleReveal() {
    if (selected === null) return;
    setRevealed(true);
    if (selected === questions[current].correctIndex) {
      setScore((s) => s + 1);
    }
  }

  function handleNext() {
    if (current < questions.length - 1) {
      setCurrent((c) => c + 1);
      setSelected(null);
      setRevealed(false);
    } else {
      setFinished(true);
      // Record completion
      fetch("/api/practice/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "QUIZ",
          topic,
          score: Math.round((score / questions.length) * 100),
        }),
      });
    }
  }

  // Topic selection
  if (questions.length === 0) {
    return (
      <div className="card p-6">
        <h3 className="font-heading text-lg font-semibold mb-2">Quiz Me 🧠</h3>
        <p className="text-sm text-text-muted mb-4">
          Pick a topic or leave blank to quiz on your target role.
        </p>
        <input
          className="input mb-3"
          placeholder="e.g. React hooks, TypeScript, CSS Grid, System Design…"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && startQuiz()}
        />
        <button
          onClick={startQuiz}
          disabled={loading}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          {loading ? (
            <><Loader2 size={15} className="animate-spin" /> Generating…</>
          ) : (
            <><Sparkles size={15} /> Generate quiz</>
          )}
        </button>
      </div>
    );
  }

  // Finished
  if (finished) {
    const pct = Math.round((score / questions.length) * 100);
    return (
      <div className="card p-8 text-center">
        <div className="text-5xl mb-4">{pct >= 80 ? "🎉" : pct >= 50 ? "👍" : "💪"}</div>
        <h3 className="font-heading text-2xl font-bold mb-2">
          {score}/{questions.length} correct
        </h3>
        <p className="text-text-muted text-sm mb-6">
          {pct >= 80
            ? "You're doing great — this topic is strong for you."
            : pct >= 50
            ? "Solid work. A bit more practice and you'll nail it."
            : "No worries — every wrong answer is something learned. Keep going."}
        </p>
        <div className="flex gap-3 justify-center">
          <button onClick={startQuiz} className="btn-secondary">
            Try again
          </button>
          <button onClick={onComplete} className="btn-primary">
            Done
          </button>
        </div>
      </div>
    );
  }

  // Question
  const q = questions[current];
  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-medium text-text-muted">
          Question {current + 1} of {questions.length}
        </span>
        <span className="text-xs font-medium text-primary">
          Score: {score}/{current}
        </span>
      </div>

      <h3 className="font-semibold text-text-primary text-base mb-4 leading-relaxed">
        {q.question}
      </h3>

      <div className="space-y-2 mb-4">
        {q.options.map((opt, i) => {
          const isCorrect = i === q.correctIndex;
          const isSelected = i === selected;
          return (
            <button
              key={i}
              onClick={() => handleSelect(i)}
              disabled={revealed}
              className={cn(
                "w-full text-left px-4 py-3 rounded-lg border text-sm transition-all",
                !revealed && isSelected && "border-primary bg-primary-50 text-primary",
                !revealed && !isSelected && "border-border hover:border-primary-200",
                revealed && isCorrect && "border-success bg-success-light text-success",
                revealed && isSelected && !isCorrect && "border-danger bg-danger-light text-danger",
                revealed && !isCorrect && !isSelected && "opacity-50"
              )}
            >
              <div className="flex items-center justify-between">
                {opt}
                {revealed && isCorrect && <CheckCircle size={16} />}
                {revealed && isSelected && !isCorrect && <XCircle size={16} />}
              </div>
            </button>
          );
        })}
      </div>

      {revealed && (
        <div className="bg-primary-50 rounded-lg p-3 text-sm text-primary mb-4">
          {q.explanation}
        </div>
      )}

      <div className="flex justify-end">
        {!revealed ? (
          <button
            onClick={handleReveal}
            disabled={selected === null}
            className="btn-primary disabled:opacity-40"
          >
            Check answer
          </button>
        ) : (
          <button onClick={handleNext} className="btn-primary">
            {current < questions.length - 1 ? "Next question" : "See results"}
          </button>
        )}
      </div>
    </div>
  );
}
