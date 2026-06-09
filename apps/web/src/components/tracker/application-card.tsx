"use client";

import { useState } from "react";
import { ExternalLink, Calendar, Trash2, FileText, ChevronDown } from "lucide-react";
import { Application, COLUMNS } from "@/lib/tracker";
import { ApplicationStatus } from "@prisma/client";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";
import { format } from "date-fns";

interface ApplicationCardProps {
  application: Application;
  onStatusChange: (id: string, status: ApplicationStatus) => void;
  onDelete: (id: string) => void;
  onNotesChange: (id: string, notes: string) => void;
}

export function ApplicationCard({
  application,
  onStatusChange,
  onDelete,
  onNotesChange,
}: ApplicationCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [notes, setNotes] = useState(application.notes || "");
  const [savingNotes, setSavingNotes] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleStatusChange(newStatus: ApplicationStatus) {
    try {
      const res = await fetch(`/api/tracker/${application.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error();
      onStatusChange(application.id, newStatus);
      toast.success(`Moved to ${COLUMNS.find((c) => c.id === newStatus)?.label}`);
    } catch {
      toast.error("Couldn't update status");
    }
  }

  async function handleSaveNotes() {
    setSavingNotes(true);
    try {
      const res = await fetch(`/api/tracker/${application.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes }),
      });
      if (!res.ok) throw new Error();
      onNotesChange(application.id, notes);
      toast.success("Notes saved");
    } catch {
      toast.error("Couldn't save notes");
    } finally {
      setSavingNotes(false);
    }
  }

  async function handleDelete() {
    if (!confirm(`Remove ${application.jobTitle} at ${application.company}?`)) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/tracker/${application.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      onDelete(application.id);
      toast.success("Removed");
    } catch {
      toast.error("Couldn't delete");
      setDeleting(false);
    }
  }

  const col = COLUMNS.find((c) => c.id === application.status);

  return (
    <div className={cn("card p-4 transition-all", expanded && "shadow-card-hover")}>
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm text-text-primary truncate">
            {application.jobTitle}
          </div>
          <div className="text-xs text-text-muted mt-0.5">
            {application.company}
            {application.location && ` · ${application.location}`}
          </div>
        </div>
        <button
          onClick={() => setExpanded((e) => !e)}
          className="text-text-muted hover:text-text-primary transition-colors p-0.5 flex-shrink-0"
        >
          <ChevronDown
            size={15}
            className={cn("transition-transform", expanded && "rotate-180")}
          />
        </button>
      </div>

      {/* Meta row */}
      <div className="flex items-center gap-2 mt-2 flex-wrap">
        {application.salary && (
          <span className="text-xs font-semibold text-text-primary">
            {application.salary}
          </span>
        )}
        {application.matchScore && application.matchScore > 0 && (
          <span className={cn(
            "text-[11px] font-medium px-2 py-0.5 rounded-full",
            application.matchScore >= 70 ? "bg-success-light text-success" : "bg-primary-50 text-primary"
          )}>
            {application.matchScore}% match
          </span>
        )}
        {application.appliedAt && (
          <span className="text-[11px] text-text-muted flex items-center gap-1">
            <Calendar size={10} />
            Applied {format(new Date(application.appliedAt), "d MMM")}
          </span>
        )}
        {application.interviewAt && (
          <span className="text-[11px] text-primary font-medium flex items-center gap-1">
            <Calendar size={10} />
            Interview {format(new Date(application.interviewAt), "d MMM")}
          </span>
        )}
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="mt-3 pt-3 border-t border-border space-y-3">
          {/* Move to */}
          <div>
            <div className="text-[11px] text-text-muted font-medium mb-1.5">
              Move to
            </div>
            <div className="flex flex-wrap gap-1.5">
              {COLUMNS.filter((c) => c.id !== application.status).map((c) => (
                <button
                  key={c.id}
                  onClick={() => handleStatusChange(c.id)}
                  className={cn(
                    "text-[11px] px-2.5 py-1 rounded-full border transition-all",
                    "border-border text-text-muted hover:border-primary hover:text-primary"
                  )}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <div className="text-[11px] text-text-muted font-medium mb-1.5 flex items-center gap-1">
              <FileText size={11} /> Notes
            </div>
            <textarea
              className="input text-xs py-2 resize-none"
              rows={3}
              placeholder="Add notes, contacts, interview prep…"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
            {notes !== (application.notes || "") && (
              <button
                onClick={handleSaveNotes}
                disabled={savingNotes}
                className="btn-primary text-xs py-1 px-3 mt-1.5"
              >
                {savingNotes ? "Saving…" : "Save notes"}
              </button>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between">
            {application.jobUrl ? (
              <a
                href={application.jobUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-primary hover:underline"
              >
                View listing <ExternalLink size={11} />
              </a>
            ) : (
              <span />
            )}
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="flex items-center gap-1 text-xs text-danger hover:opacity-70 transition-opacity"
            >
              <Trash2 size={11} />
              {deleting ? "Removing…" : "Remove"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
