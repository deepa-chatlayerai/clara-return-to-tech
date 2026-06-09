"use client";

import { FileText, Star, Trash2, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import toast from "react-hot-toast";

export interface CVVersion {
  id: string;
  name: string;
  content: string;
  tailoredFor: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CVListProps {
  cvs: CVVersion[];
  selectedId: string | null;
  onSelect: (cv: CVVersion) => void;
  onDelete: (id: string) => void;
  onSetActive: (id: string) => void;
  onNew: () => void;
}

export function CVList({
  cvs,
  selectedId,
  onSelect,
  onDelete,
  onSetActive,
  onNew,
}: CVListProps) {
  async function handleSetActive(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/cv/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: true }),
      });
      if (!res.ok) throw new Error();
      onSetActive(id);
      toast.success("Set as active CV");
    } catch {
      toast.error("Couldn't update");
    }
  }

  async function handleDelete(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    if (!confirm("Delete this CV version?")) return;
    try {
      const res = await fetch(`/api/cv/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      onDelete(id);
      toast.success("Deleted");
    } catch {
      toast.error("Couldn't delete");
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-text-muted uppercase tracking-wide">
          Saved versions
        </span>
        <button
          onClick={onNew}
          className="flex items-center gap-1 text-xs text-primary hover:opacity-70"
        >
          <Plus size={13} /> New
        </button>
      </div>

      {cvs.length === 0 && (
        <div className="text-xs text-text-muted text-center py-6 border border-dashed border-border rounded-lg">
          No CVs yet. Paste yours below to get started.
        </div>
      )}

      {cvs.map((cv) => (
        <div
          key={cv.id}
          onClick={() => onSelect(cv)}
          className={cn(
            "p-3 rounded-lg border cursor-pointer transition-all group",
            selectedId === cv.id
              ? "border-primary bg-primary-50"
              : "border-border hover:border-primary-200 hover:bg-background"
          )}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <FileText
                size={14}
                className={cn(
                  selectedId === cv.id ? "text-primary" : "text-text-muted"
                )}
              />
              <div className="min-w-0">
                <div className="text-xs font-semibold text-text-primary truncate">
                  {cv.name}
                </div>
                {cv.tailoredFor && (
                  <div className="text-[11px] text-text-muted truncate">
                    for {cv.tailoredFor}
                  </div>
                )}
                <div className="text-[11px] text-text-muted">
                  {format(new Date(cv.updatedAt), "d MMM yyyy")}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              {cv.isActive ? (
                <span className="text-[10px] bg-success-light text-success px-1.5 py-0.5 rounded font-medium">
                  Active
                </span>
              ) : (
                <button
                  onClick={(e) => handleSetActive(cv.id, e)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Set as active"
                >
                  <Star size={13} className="text-text-muted hover:text-warning" />
                </button>
              )}
              <button
                onClick={(e) => handleDelete(cv.id, e)}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 size={13} className="text-text-muted hover:text-danger" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
