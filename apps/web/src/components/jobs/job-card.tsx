"use client";

import { useState } from "react";
import { ExternalLink, Bookmark, BookmarkCheck, MapPin, Clock, Briefcase } from "lucide-react";
import { cn } from "@/lib/utils";
import { AdzunaJob, formatSalary, timeAgo } from "@/lib/adzuna";
import toast from "react-hot-toast";

interface JobCardProps {
  job: AdzunaJob & { matchScore: number };
  onSaved?: (jobId: string) => void;
}

export function JobCard({ job, onSaved }: JobCardProps) {
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const salary = formatSalary(job.salary_min, job.salary_max);
  const posted = timeAgo(job.created);
  const isPartTime = job.contract_time === "part_time";
  const score = job.matchScore;

  async function handleSave() {
    if (saved || saving) return;
    setSaving(true);

    try {
      const res = await fetch("/api/jobs/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobTitle: job.title,
          company: job.company.display_name,
          location: job.location.display_name,
          jobUrl: job.redirect_url,
          salary: salary,
          matchScore: score,
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
      onSaved?.(job.id);
    } catch {
      toast.error("Couldn't save — try again");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="card p-5 hover:shadow-card-hover transition-all group">
      <div className="flex items-start justify-between gap-4">
        {/* Company logo placeholder */}
        <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center flex-shrink-0 text-primary font-bold text-sm">
          {job.company.display_name.charAt(0).toUpperCase()}
        </div>

        <div className="flex-1 min-w-0">
          {/* Title + company */}
          <h3 className="font-semibold text-text-primary text-sm leading-snug truncate group-hover:text-primary transition-colors">
            {job.title}
          </h3>
          <p className="text-text-muted text-xs mt-0.5">
            {job.company.display_name}
          </p>

          {/* Meta row */}
          <div className="flex items-center gap-3 mt-2 flex-wrap">
            <span className="flex items-center gap-1 text-xs text-text-muted">
              <MapPin size={11} />
              {job.location.display_name}
            </span>
            <span className="flex items-center gap-1 text-xs text-text-muted">
              <Clock size={11} />
              {posted}
            </span>
            {isPartTime && (
              <span className="tag bg-success-light text-success text-[11px]">
                Part-time
              </span>
            )}
            {job.contract_time === "full_time" && (
              <span className="tag bg-background text-text-muted border border-border text-[11px]">
                Full-time
              </span>
            )}
          </div>

          {/* Description snippet */}
          <p className="text-xs text-text-muted mt-2 line-clamp-2 leading-relaxed">
            {job.description.replace(/<[^>]*>/g, "").slice(0, 160)}…
          </p>
        </div>

        {/* Right side */}
        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          {/* Match score */}
          {score > 0 && (
            <div
              className={cn(
                "text-xs font-bold px-2 py-0.5 rounded-full",
                score >= 70
                  ? "bg-success-light text-success"
                  : score >= 40
                  ? "bg-warning-light text-warning"
                  : "bg-background text-text-muted"
              )}
            >
              {score}% match
            </div>
          )}

          {/* Salary */}
          {salary && (
            <div className="text-xs font-semibold text-text-primary">
              {salary}
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="tag bg-primary-50 text-primary text-[11px]">
            {job.category.label}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className={cn(
              "flex items-center gap-1.5 text-xs px-3 py-1.5 rounded border transition-all",
              saved
                ? "border-success text-success bg-success-light"
                : "border-border text-text-muted hover:border-primary hover:text-primary"
            )}
          >
            {saved ? (
              <BookmarkCheck size={13} />
            ) : (
              <Bookmark size={13} />
            )}
            {saved ? "Saved" : saving ? "Saving…" : "Save"}
          </button>
          <a
            href={job.redirect_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded bg-primary text-white hover:bg-primary-600 transition-colors"
          >
            Apply <ExternalLink size={11} />
          </a>
        </div>
      </div>
    </div>
  );
}
