"use client";

import { useState } from "react";
import { Sparkles, Copy, Save, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

interface TailorAnalysis {
  matchKeywords: string[];
  missingKeywords: string[];
  gapReframe: string | null;
  matchScore: number;
}

interface TailorPanelProps {
  cvContent: string;
  onSaveTailored: (content: string, jobTitle: string, company: string) => void;
}

export function TailorPanel({ cvContent, onSaveTailored }: TailorPanelProps) {
  const [jobDescription, setJobDescription] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [loading, setLoading] = useState(false);
  const [tailored, setTailored] = useState("");
  const [analysis, setAnalysis] = useState<TailorAnalysis | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleTailor() {
    if (!cvContent) {
      toast.error("Please add your CV first");
      return;
    }
    if (!jobDescription.trim()) {
      toast.error("Please paste the job description");
      return;
    }

    setLoading(true);
    setTailored("");
    setAnalysis(null);

    try {
      const res = await fetch("/api/cv/tailor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cvContent, jobDescription, jobTitle, company }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setTailored(data.tailoredContent);
      setAnalysis(data.analysis);
    } catch (err: any) {
      toast.error(err.message || "Tailoring failed — please try again");
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(tailored);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  }

  function handleSave() {
    if (!jobTitle || !company) {
      toast.error("Add job title and company to save this version");
      return;
    }
    onSaveTailored(tailored, jobTitle, company);
  }

  return (
    <div className="space-y-4">
      {/* Job details */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Job title</label>
          <input
            className="input"
            placeholder="e.g. Frontend Developer"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
          />
        </div>
        <div>
          <label className="label">Company</label>
          <input
            className="input"
            placeholder="e.g. Proximus"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
          />
        </div>
      </div>

      {/* Job description */}
      <div>
        <label className="label">
          Paste the job description
          <span className="text-text-muted font-normal ml-1">
            — the more detail the better
          </span>
        </label>
        <textarea
          className="input resize-none text-sm"
          rows={8}
          placeholder="Paste the full job description here…"
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
        />
      </div>

      <button
        onClick={handleTailor}
        disabled={loading || !cvContent || !jobDescription}
        className="btn-primary w-full flex items-center justify-center gap-2 py-3"
      >
        <Sparkles size={16} />
        {loading ? "Tailoring your CV…" : "Tailor my CV with AI"}
      </button>

      {loading && (
        <div className="card p-6 text-center">
          <div className="text-3xl mb-3">✨</div>
          <p className="text-sm text-text-muted">
            Clara is reading the job description and tailoring your CV…
          </p>
          <p className="text-xs text-text-muted mt-1">
            This takes about 15–20 seconds
          </p>
        </div>
      )}

      {/* Analysis */}
      {analysis && (
        <div className="card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold">Match Analysis</span>
            <span
              className={cn(
                "text-sm font-bold px-3 py-0.5 rounded-full",
                analysis.matchScore >= 70
                  ? "bg-success-light text-success"
                  : analysis.matchScore >= 40
                  ? "bg-warning-light text-warning"
                  : "bg-danger-light text-danger"
              )}
            >
              {analysis.matchScore}% match
            </span>
          </div>

          {analysis.gapReframe && (
            <div className="bg-primary-50 rounded-lg p-3 text-xs text-primary">
              <span className="font-semibold">Gap reframed: </span>
              {analysis.gapReframe}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-xs font-semibold text-success mb-1.5">
                ✓ Keywords matched
              </div>
              <div className="flex flex-wrap gap-1">
                {analysis.matchKeywords?.map((k) => (
                  <span
                    key={k}
                    className="tag bg-success-light text-success text-[11px]"
                  >
                    {k}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <div className="text-xs font-semibold text-warning mb-1.5">
                ⚠ Consider adding
              </div>
              <div className="flex flex-wrap gap-1">
                {analysis.missingKeywords?.map((k) => (
                  <span
                    key={k}
                    className="tag bg-warning-light text-warning text-[11px]"
                  >
                    {k}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tailored result */}
      {tailored && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="label mb-0">Tailored CV</label>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 text-xs text-text-muted hover:text-text-primary border border-border rounded px-3 py-1.5 transition-all"
              >
                {copied ? (
                  <CheckCircle size={13} className="text-success" />
                ) : (
                  <Copy size={13} />
                )}
                {copied ? "Copied" : "Copy"}
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-1.5 text-xs btn-primary px-3 py-1.5"
              >
                <Save size={13} />
                Save version
              </button>
            </div>
          </div>
          <textarea
            className="input resize-none text-sm font-mono leading-relaxed"
            rows={20}
            value={tailored}
            onChange={(e) => setTailored(e.target.value)}
          />
          <p className="text-xs text-text-muted mt-2">
            You can edit the result above before saving or copying.
          </p>
        </div>
      )}
    </div>
  );
}
