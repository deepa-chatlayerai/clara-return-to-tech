"use client";

import { useState } from "react";
import { ExternalLink, Bookmark, BookmarkCheck, MapPin, Clock, Linkedin } from "lucide-react";
import { LinkedInJob } from "@/lib/linkedin";
import toast from "react-hot-toast";

interface LinkedInJobCardProps {
  job: LinkedInJob;
}

export function LinkedInJobCard({ job }: LinkedInJobCardProps) {
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (saved || saving) return;
    setSaving(true);

    try {
      const res = await fetch("/api/jobs/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobTitle: job.title,
          company: job.company,
          location: job.location,
          jobUrl: job.url,
          salary: job.salary || null,
          matchScore: null,
        }),
      });

      if (res.status === 409) {
        toast("Already saved to your tracker");
        setSaved(true);
        return;
      }

      if (!res.ok) throw new Error();
      setSaved(true);
      toast.success("Saved to your tracker");
    } catch {
      toast.error("Couldn't save — try again");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="card p-5 hover:shadow-card-hover transition-all group">
      <div className="flex items-start justify-between gap-4">
        <div className="w-10 h-10 rounded-lg bg-[#0A66C2]/10 flex items-center justify-center flex-shrink-0">
          <Linkedin size={18} className="text-[#0A66C2]" />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-text-primary text-sm leading-snug truncate group-hover:text-primary transition-colors">
            {job.title}
          </h3>
          <p className="text-text-muted text-xs mt-0.5">
            {job.company}
          </p>

          <div className="flex items-center gap-3 mt-2 flex-wrap">
            {job.location && (
              <span className="flex items-center gap-1 text-xs text-text-muted">
                <MapPin size={11} />
                {job.location}
              </span>
            )}
            {job.date && (
              <span className="flex items-center gap-1 text-xs text-text-muted">
                <Clock size={11} />
                {job.date}
              </span>
            )}
            {job.contractType && (
              <span className="tag bg-primary-50 text-primary text-[11px]">
                {job.contractType === "F" ? "Full-time" : job.contractType === "P" ? "Part-time" : job.contractType}
              </span>
            )}
            {job.remote && (
              <span className="tag bg-success-light text-success text-[11px]">
                {job.remote === "2" ? "Remote" : job.remote === "3" ? "Hybrid" : job.remote}
              </span>
            )}
          </div>

          {job.description && (
            <p className="text-xs text-text-muted mt-2 line-clamp-2 leading-relaxed">
              {job.description.replace(/<[^>]*>/g, "").slice(0, 160)}...
            </p>
          )}
        </div>

        {job.salary && (
          <div className="text-xs font-bold text-text-primary flex-shrink-0">
            {job.salary}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
        <span className="text-[11px] text-[#0A66C2] font-semibold flex items-center gap-1">
          <Linkedin size={11} /> LinkedIn
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-all ${
              saved
                ? "border-success text-success bg-success-light"
                : "border-border text-text-muted hover:border-primary hover:text-primary"
            }`}
          >
            {saved ? <BookmarkCheck size={13} /> : <Bookmark size={13} />}
            {saved ? "Saved" : saving ? "Saving..." : "Save"}
          </button>
          <a
            href={job.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-[#0A66C2] text-white hover:bg-[#004182] transition-colors"
          >
            Apply on LinkedIn <ExternalLink size={11} />
          </a>
        </div>
      </div>
    </div>
  );
}
