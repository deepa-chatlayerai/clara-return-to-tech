"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Application } from "@/lib/tracker";
import toast from "react-hot-toast";

interface AddApplicationModalProps {
  onClose: () => void;
  onAdded: (application: Application) => void;
}

export function AddApplicationModal({ onClose, onAdded }: AddApplicationModalProps) {
  const [form, setForm] = useState({
    jobTitle: "",
    company: "",
    location: "",
    jobUrl: "",
    salary: "",
    notes: "",
    status: "APPLIED",
  });
  const [loading, setLoading] = useState(false);

  function update(key: string, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/tracker", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onAdded(data.application);
      toast.success("Application added");
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-surface rounded-xl shadow-modal w-full max-w-md animate-slide-up">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="font-heading font-semibold text-base">Add application</h2>
          <button onClick={onClose} className="text-text-muted hover:text-text-primary">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="label">Job title *</label>
              <input
                className="input"
                placeholder="e.g. Frontend Developer"
                value={form.jobTitle}
                onChange={(e) => update("jobTitle", e.target.value)}
                required
              />
            </div>
            <div className="col-span-2">
              <label className="label">Company *</label>
              <input
                className="input"
                placeholder="e.g. Proximus"
                value={form.company}
                onChange={(e) => update("company", e.target.value)}
                required
              />
            </div>
            <div>
              <label className="label">Location</label>
              <input
                className="input"
                placeholder="Brussels"
                value={form.location}
                onChange={(e) => update("location", e.target.value)}
              />
            </div>
            <div>
              <label className="label">Salary</label>
              <input
                className="input"
                placeholder="€55k"
                value={form.salary}
                onChange={(e) => update("salary", e.target.value)}
              />
            </div>
            <div className="col-span-2">
              <label className="label">Job URL</label>
              <input
                className="input"
                placeholder="https://..."
                value={form.jobUrl}
                onChange={(e) => update("jobUrl", e.target.value)}
              />
            </div>
            <div className="col-span-2">
              <label className="label">Status</label>
              <select
                className="input"
                value={form.status}
                onChange={(e) => update("status", e.target.value)}
              >
                <option value="SAVED">Saved</option>
                <option value="APPLIED">Applied</option>
                <option value="INTERVIEW">Interview</option>
                <option value="OFFER">Offer</option>
                <option value="CLOSED">Closed</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="label">Notes</label>
              <textarea
                className="input resize-none"
                rows={2}
                placeholder="Any notes, contacts, or reminders…"
                value={form.notes}
                onChange={(e) => update("notes", e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="btn-ghost flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex-1"
            >
              {loading ? "Adding…" : "Add application"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
