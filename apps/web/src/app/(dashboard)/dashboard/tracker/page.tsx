"use client";

import { useState, useEffect } from "react";
import { Plus, BriefcaseIcon, TrendingUp, Calendar, Award } from "lucide-react";
import { Application, COLUMNS } from "@/lib/tracker";
import { ApplicationStatus } from "@prisma/client";
import { ApplicationCard } from "@/components/tracker/application-card";
import { AddApplicationModal } from "@/components/tracker/add-application-modal";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

export default function TrackerPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [activeCol, setActiveCol] = useState<ApplicationStatus | "ALL">("ALL");

  useEffect(() => {
    fetchApplications();
  }, []);

  async function fetchApplications() {
    try {
      const res = await fetch("/api/tracker");
      const data = await res.json();
      setApplications(data.applications || []);
    } catch {
      toast.error("Couldn't load applications");
    } finally {
      setLoading(false);
    }
  }

  function handleStatusChange(id: string, status: ApplicationStatus) {
    setApplications((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status } : a))
    );
  }

  function handleDelete(id: string) {
    setApplications((prev) => prev.filter((a) => a.id !== id));
  }

  function handleNotesChange(id: string, notes: string) {
    setApplications((prev) =>
      prev.map((a) => (a.id === id ? { ...a, notes } : a))
    );
  }

  function handleAdded(application: Application) {
    setApplications((prev) => [application, ...prev]);
  }

  // Stats
  const total = applications.length;
  const applied = applications.filter((a) => a.status !== "SAVED").length;
  const interviews = applications.filter((a) => a.status === "INTERVIEW").length;
  const offers = applications.filter((a) => a.status === "OFFER").length;
  const responseRate = applied > 0 ? Math.round((interviews + offers) / applied * 100) : 0;

  // Filtered apps
  const filtered = activeCol === "ALL"
    ? applications
    : applications.filter((a) => a.status === activeCol);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="card p-5 animate-pulse">
            <div className="h-4 bg-border rounded w-1/3 mb-2" />
            <div className="h-3 bg-border rounded w-1/4" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="card p-4 flex items-center gap-3">
          <div className="w-9 h-9 bg-primary-50 rounded-lg flex items-center justify-center">
            <BriefcaseIcon size={16} className="text-primary" />
          </div>
          <div>
            <div className="text-2xl font-bold text-text-primary">{total}</div>
            <div className="text-xs text-text-muted">Total tracked</div>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-3">
          <div className="w-9 h-9 bg-primary-50 rounded-lg flex items-center justify-center">
            <TrendingUp size={16} className="text-primary" />
          </div>
          <div>
            <div className="text-2xl font-bold text-text-primary">{applied}</div>
            <div className="text-xs text-text-muted">Applied</div>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-3">
          <div className="w-9 h-9 bg-warning-light rounded-lg flex items-center justify-center">
            <Calendar size={16} className="text-warning" />
          </div>
          <div>
            <div className="text-2xl font-bold text-text-primary">{interviews}</div>
            <div className="text-xs text-text-muted">Interviews</div>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-3">
          <div className="w-9 h-9 bg-success-light rounded-lg flex items-center justify-center">
            <Award size={16} className="text-success" />
          </div>
          <div>
            <div className="text-2xl font-bold text-text-primary">
              {offers > 0 ? offers : `${responseRate}%`}
            </div>
            <div className="text-xs text-text-muted">
              {offers > 0 ? "Offers" : "Response rate"}
            </div>
          </div>
        </div>
      </div>

      {/* Header + add button */}
      <div className="flex items-center justify-between mb-4">
        {/* Column filter tabs */}
        <div className="flex items-center gap-1 flex-wrap">
          <button
            onClick={() => setActiveCol("ALL")}
            className={cn(
              "text-xs px-3 py-1.5 rounded-full border transition-all font-medium",
              activeCol === "ALL"
                ? "bg-primary text-white border-primary"
                : "border-border text-text-muted hover:border-primary hover:text-primary"
            )}
          >
            All ({total})
          </button>
          {COLUMNS.map((col) => {
            const count = applications.filter((a) => a.status === col.id).length;
            return (
              <button
                key={col.id}
                onClick={() => setActiveCol(col.id)}
                className={cn(
                  "text-xs px-3 py-1.5 rounded-full border transition-all font-medium flex items-center gap-1.5",
                  activeCol === col.id
                    ? "bg-primary text-white border-primary"
                    : "border-border text-text-muted hover:border-primary hover:text-primary"
                )}
              >
                <span className={cn("w-1.5 h-1.5 rounded-full", col.dot)} />
                {col.label}
                <span className="opacity-70">({count})</span>
              </button>
            );
          })}
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center gap-2 text-sm flex-shrink-0"
        >
          <Plus size={15} />
          Add manually
        </button>
      </div>

      {/* Kanban columns */}
      {activeCol === "ALL" ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {COLUMNS.map((col) => {
            const colApps = applications.filter((a) => a.status === col.id);
            return (
              <div key={col.id} className="bg-background rounded-xl p-3">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className={cn("w-2 h-2 rounded-full", col.dot)} />
                    <span className={cn("text-xs font-bold uppercase tracking-wide", col.color)}>
                      {col.label}
                    </span>
                  </div>
                  <span className="text-xs text-text-muted bg-border px-2 py-0.5 rounded-full">
                    {colApps.length}
                  </span>
                </div>
                <div className="space-y-2">
                  {colApps.length === 0 ? (
                    <div className="text-xs text-text-muted text-center py-6 border border-dashed border-border rounded-lg">
                      {col.description}
                    </div>
                  ) : (
                    colApps.map((app) => (
                      <ApplicationCard
                        key={app.id}
                        application={app}
                        onStatusChange={handleStatusChange}
                        onDelete={handleDelete}
                        onNotesChange={handleNotesChange}
                      />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        // Single column list view when filtering
        <div className="max-w-2xl space-y-3">
          {filtered.length === 0 ? (
            <div className="card p-12 text-center">
              <div className="text-4xl mb-3">📋</div>
              <h3 className="font-heading font-semibold mb-1">Nothing here yet</h3>
              <p className="text-text-muted text-sm">
                {activeCol === "SAVED"
                  ? "Save jobs from the listings page to see them here."
                  : "Move applications here as your job search progresses."}
              </p>
            </div>
          ) : (
            filtered.map((app) => (
              <ApplicationCard
                key={app.id}
                application={app}
                onStatusChange={handleStatusChange}
                onDelete={handleDelete}
                onNotesChange={handleNotesChange}
              />
            ))
          )}
        </div>
      )}

      {/* Empty state — no applications at all */}
      {total === 0 && !loading && (
        <div className="card p-16 text-center mt-4">
          <div className="text-5xl mb-4">🌱</div>
          <h3 className="font-heading text-xl font-semibold mb-2">
            Your tracker is empty
          </h3>
          <p className="text-text-muted text-sm max-w-sm mx-auto mb-6">
            Save jobs from the listings page and they'll appear here automatically.
            Or add one manually to get started.
          </p>
          <div className="flex items-center justify-center gap-3">
            <a href="/dashboard/jobs" className="btn-primary">
              Browse jobs
            </a>
            <button
              onClick={() => setShowModal(true)}
              className="btn-secondary"
            >
              Add manually
            </button>
          </div>
        </div>
      )}

      {showModal && (
        <AddApplicationModal
          onClose={() => setShowModal(false)}
          onAdded={handleAdded}
        />
      )}
    </div>
  );
}
