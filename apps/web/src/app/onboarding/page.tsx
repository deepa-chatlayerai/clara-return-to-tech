"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { ArrowRight, ArrowLeft } from "lucide-react";

const STEPS = [
  {
    id: 1,
    question: "What role are you aiming for?",
    hint: "Be specific — it helps us match you to the right jobs and courses.",
    field: "targetRole",
    placeholder: "e.g. Frontend Developer, Data Analyst, UX Designer",
    type: "text",
  },
  {
    id: 2,
    question: "Where are you based?",
    hint: "We'll find jobs and women near you.",
    field: "currentLocation",
    placeholder: "e.g. Brussels, Ghent, Antwerp",
    type: "text",
  },
  {
    id: 3,
    question: "How long have you been on a break?",
    hint: "No judgment — this helps us understand your situation and frame your story.",
    field: "careerGapYears",
    placeholder: "",
    type: "select",
    options: [
      { value: "1", label: "Less than a year" },
      { value: "2", label: "1–2 years" },
      { value: "4", label: "3–5 years" },
      { value: "7", label: "6–10 years" },
      { value: "11", label: "More than 10 years" },
    ],
  },
  {
    id: 4,
    question: "How much time can you give per day?",
    hint: "Even 10 minutes counts. Clara works around your life, not the other way around.",
    field: "dailyMinutes",
    placeholder: "",
    type: "select",
    options: [
      { value: "10", label: "10 minutes — I'm squeezing it in" },
      { value: "30", label: "30 minutes — I have a little time" },
      { value: "60", label: "1 hour — I'm ready to focus" },
      { value: "120", label: "2+ hours — I'm fully committed" },
    ],
  },
];

export default function OnboardingPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;
  const firstName = session?.user?.name?.split(" ")[0] || "there";

  function handleAnswer(value: string) {
    setAnswers((prev) => ({ ...prev, [current.field]: value }));
  }

  async function handleNext() {
    if (!answers[current.field]) {
      toast.error("Please answer before continuing.");
      return;
    }

    if (!isLast) {
      setStep((s) => s + 1);
      return;
    }

    // Save onboarding data
    setLoading(true);
    try {
      const res = await fetch("/api/profile/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(answers),
      });

      if (!res.ok) throw new Error();
      router.push("/dashboard");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-12">
          <div className="font-heading text-2xl font-bold text-primary mb-2">Clara</div>
          {step === 0 && (
            <p className="text-text-muted text-sm">
              Hi {firstName} 👋 Just a few quick questions to get you started.
            </p>
          )}
        </div>

        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-10">
          {STEPS.map((s, i) => (
            <div
              key={s.id}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === step
                  ? "w-8 bg-primary"
                  : i < step
                  ? "w-4 bg-primary-200"
                  : "w-4 bg-border"
              }`}
            />
          ))}
        </div>

        {/* Question card */}
        <div className="card p-8 animate-slide-up">
          <h2 className="font-heading text-2xl font-semibold text-text-primary mb-2">
            {current.question}
          </h2>
          <p className="text-text-muted text-sm mb-6">{current.hint}</p>

          {current.type === "text" && (
            <input
              type="text"
              className="input text-base py-3"
              placeholder={current.placeholder}
              value={answers[current.field] || ""}
              onChange={(e) => handleAnswer(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleNext()}
              autoFocus
            />
          )}

          {current.type === "select" && (
            <div className="space-y-3">
              {current.options?.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleAnswer(opt.value)}
                  className={`w-full text-left px-4 py-3 rounded border text-sm font-medium transition-all ${
                    answers[current.field] === opt.value
                      ? "border-primary bg-primary-50 text-primary"
                      : "border-border hover:border-primary-200 hover:bg-background text-text-primary"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6">
          <button
            onClick={() => setStep((s) => s - 1)}
            className={`btn-ghost flex items-center gap-2 ${step === 0 ? "invisible" : ""}`}
          >
            <ArrowLeft size={16} /> Back
          </button>
          <button
            onClick={handleNext}
            disabled={loading || !answers[current.field]}
            className="btn-primary flex items-center gap-2 px-6"
          >
            {loading ? "Saving…" : isLast ? "Go to my dashboard" : "Continue"}
            {!loading && <ArrowRight size={16} />}
          </button>
        </div>
      </div>
    </div>
  );
}
