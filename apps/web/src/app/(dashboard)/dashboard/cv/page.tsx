"use client";

import { useState, useEffect } from "react";
import { FileText, Sparkles, Info } from "lucide-react";
import { CVList, CVVersion } from "@/components/cv/cv-list";
import { TailorPanel } from "@/components/cv/tailor-panel";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

type Tab = "base" | "tailor";

export default function CVPage() {
  const [cvs, setCvs] = useState<CVVersion[]>([]);
  const [selectedCV, setSelectedCV] = useState<CVVersion | null>(null);
  const [baseContent, setBaseContent] = useState("");
  const [cvName, setCvName] = useState("My CV");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("base");
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    fetchCVs();
  }, []);

  async function fetchCVs() {
    try {
      const res = await fetch("/api/cv");
      const data = await res.json();
      setCvs(data.cvs || []);
      // Auto-select active CV
      const active = data.cvs?.find((c: CVVersion) => c.isActive);
      if (active) {
        setSelectedCV(active);
        setBaseContent(active.content);
        setCvName(active.name);
      }
    } catch {
      toast.error("Couldn't load CVs");
    } finally {
      setLoading(false);
    }
  }

  function handleSelectCV(cv: CVVersion) {
    setSelectedCV(cv);
    setBaseContent(cv.content);
    setCvName(cv.name);
    setEditing(false);
  }

  function handleNew() {
    setSelectedCV(null);
    setBaseContent("");
    setCvName("My CV");
    setEditing(true);
    setTab("base");
  }

  async function handleSaveBase() {
    if (!baseContent.trim()) {
      toast.error("Please add your CV content");
      return;
    }

    setSaving(true);
    try {
      if (selectedCV) {
        // Update existing
        const res = await fetch(`/api/cv/${selectedCV.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: cvName, content: baseContent }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setCvs((prev) =>
          prev.map((c) => (c.id === selectedCV.id ? data.cv : c))
        );
        setSelectedCV(data.cv);
        toast.success("CV saved");
      } else {
        // Create new
        const res = await fetch("/api/cv", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: cvName,
            content: baseContent,
            isActive: cvs.length === 0, // first CV is auto-active
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setCvs((prev) => [data.cv, ...prev]);
        setSelectedCV(data.cv);
        toast.success("CV saved");
      }
      setEditing(false);
    } catch (err: any) {
      toast.error(err.message || "Couldn't save");
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveTailored(
    content: string,
    jobTitle: string,
    company: string
  ) {
    try {
      const res = await fetch("/api/cv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${jobTitle} @ ${company}`,
          content,
          tailoredFor: `${jobTitle} at ${company}`,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setCvs((prev) => [data.cv, ...prev]);
      toast.success("Tailored CV saved as a new version");
    } catch (err: any) {
      toast.error(err.message || "Couldn't save");
    }
  }

  function handleDelete(id: string) {
    setCvs((prev) => prev.filter((c) => c.id !== id));
    if (selectedCV?.id === id) {
      setSelectedCV(null);
      setBaseContent("");
    }
  }

  function handleSetActive(id: string) {
    setCvs((prev) =>
      prev.map((c) => ({ ...c, isActive: c.id === id }))
    );
  }

  return (
    <div className="flex gap-6 animate-fade-in h-full">
      {/* Left sidebar — CV versions */}
      <div className="w-64 flex-shrink-0">
        <div className="card p-4 sticky top-0">
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-14 bg-border rounded-lg animate-pulse" />
              ))}
            </div>
          ) : (
            <CVList
              cvs={cvs}
              selectedId={selectedCV?.id || null}
              onSelect={handleSelectCV}
              onDelete={handleDelete}
              onSetActive={handleSetActive}
              onNew={handleNew}
            />
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 min-w-0">
        {/* Tabs */}
        <div className="flex items-center gap-1 mb-5 border-b border-border">
          {(["base", "tailor"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-all",
                tab === t
                  ? "border-primary text-primary"
                  : "border-transparent text-text-muted hover:text-text-primary"
              )}
            >
              {t === "base" ? (
                <><FileText size={14} /> My CV</>
              ) : (
                <><Sparkles size={14} /> Tailor with AI</>
              )}
            </button>
          ))}
        </div>

        {/* Base CV tab */}
        {tab === "base" && (
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <input
                    className="input text-base font-semibold max-w-xs"
                    value={cvName}
                    onChange={(e) => setCvName(e.target.value)}
                    placeholder="CV name"
                  />
                  {selectedCV?.isActive && (
                    <span className="tag bg-success-light text-success text-xs">
                      Active
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Hint */}
            {!selectedCV && !editing && (
              <div className="card p-6 text-center">
                <div className="text-4xl mb-3">📄</div>
                <h3 className="font-heading text-lg font-semibold mb-2">
                  Add your CV
                </h3>
                <p className="text-text-muted text-sm max-w-sm mx-auto mb-4">
                  Paste your CV as plain text. Clara will use it to tailor
                  versions for specific jobs.
                </p>
                <button onClick={handleNew} className="btn-primary">
                  Add my CV
                </button>
              </div>
            )}

            {(selectedCV || editing) && (
              <>
                <div className="bg-primary-50 rounded-lg p-3 flex items-start gap-2 text-xs text-primary">
                  <Info size={14} className="flex-shrink-0 mt-0.5" />
                  <span>
                    Paste your CV as plain text. Include your work history,
                    skills, and any projects. Don't worry about formatting —
                    Clara handles that during tailoring.
                  </span>
                </div>
                <textarea
                  className="input resize-none text-sm leading-relaxed font-mono"
                  rows={24}
                  placeholder={`Name: Your Name
Location: Brussels, Belgium
Email: you@email.com

PROFESSIONAL SUMMARY
Experienced frontend developer with...

WORK EXPERIENCE
Company Name | Job Title | 2015–2018
- Achievement or responsibility
- Achievement or responsibility

CAREER BREAK | 2018–2025
Family and personal development. Continued learning through...

SKILLS
React, TypeScript, Node.js...

EDUCATION
...`}
                  value={baseContent}
                  onChange={(e) => setBaseContent(e.target.value)}
                />
                <div className="flex items-center justify-between">
                  <p className="text-xs text-text-muted">
                    {baseContent.length} characters ·{" "}
                    {baseContent.split("\n").filter(Boolean).length} lines
                  </p>
                  <div className="flex gap-3">
                    {editing && selectedCV && (
                      <button
                        onClick={() => {
                          setBaseContent(selectedCV.content);
                          setEditing(false);
                        }}
                        className="btn-ghost"
                      >
                        Cancel
                      </button>
                    )}
                    <button
                      onClick={handleSaveBase}
                      disabled={saving}
                      className="btn-primary px-6"
                    >
                      {saving ? "Saving…" : "Save CV"}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Tailor tab */}
        {tab === "tailor" && (
          <>
            {!baseContent ? (
              <div className="card p-8 text-center">
                <div className="text-4xl mb-3">✨</div>
                <h3 className="font-heading text-lg font-semibold mb-2">
                  Add your CV first
                </h3>
                <p className="text-text-muted text-sm mb-4">
                  Go to the "My CV" tab and paste your CV before tailoring.
                </p>
                <button onClick={() => setTab("base")} className="btn-primary">
                  Add my CV
                </button>
              </div>
            ) : (
              <TailorPanel
                cvContent={baseContent}
                onSaveTailored={handleSaveTailored}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
