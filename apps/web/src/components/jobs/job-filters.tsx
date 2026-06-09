"use client";

import { Search, MapPin, SlidersHorizontal } from "lucide-react";

export interface FilterState {
  what: string;
  where: string;
  contractTime: "" | "full_time" | "part_time";
  salaryMin: string;
}

interface JobFiltersProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  onSearch: () => void;
  loading: boolean;
  totalCount: number;
}

export function JobFilters({
  filters,
  onChange,
  onSearch,
  loading,
  totalCount,
}: JobFiltersProps) {
  function update(key: keyof FilterState, value: string) {
    onChange({ ...filters, [key]: value });
  }

  return (
    <div className="card p-4 mb-6">
      {/* Main search row */}
      <div className="flex gap-3 mb-3">
        <div className="relative flex-1">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
          />
          <input
            type="text"
            className="input pl-9"
            placeholder="Job title, skill, keyword…"
            value={filters.what}
            onChange={(e) => update("what", e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onSearch()}
          />
        </div>
        <div className="relative w-52">
          <MapPin
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
          />
          <input
            type="text"
            className="input pl-9"
            placeholder="Location…"
            value={filters.where}
            onChange={(e) => update("where", e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onSearch()}
          />
        </div>
        <button
          onClick={onSearch}
          disabled={loading}
          className="btn-primary px-6 flex items-center gap-2"
        >
          <Search size={14} />
          {loading ? "Searching…" : "Search"}
        </button>
      </div>

      {/* Filter chips row */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-1.5 text-xs text-text-muted">
          <SlidersHorizontal size={13} />
          Filters:
        </div>

        {/* Contract time */}
        {(["", "full_time", "part_time"] as const).map((val) => (
          <button
            key={val}
            onClick={() => update("contractTime", val)}
            className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
              filters.contractTime === val
                ? "border-primary bg-primary-50 text-primary font-medium"
                : "border-border text-text-muted hover:border-primary-200"
            }`}
          >
            {val === "" ? "Any type" : val === "full_time" ? "Full-time" : "Part-time"}
          </button>
        ))}

        <div className="w-px h-4 bg-border mx-1" />

        {/* Salary min */}
        {[
          { label: "Any salary", value: "" },
          { label: "€30k+", value: "30000" },
          { label: "€45k+", value: "45000" },
          { label: "€60k+", value: "60000" },
        ].map((opt) => (
          <button
            key={opt.value}
            onClick={() => update("salaryMin", opt.value)}
            className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
              filters.salaryMin === opt.value
                ? "border-primary bg-primary-50 text-primary font-medium"
                : "border-border text-text-muted hover:border-primary-200"
            }`}
          >
            {opt.label}
          </button>
        ))}

        {/* Results count */}
        {totalCount > 0 && (
          <span className="ml-auto text-xs text-text-muted">
            {totalCount.toLocaleString()} jobs found
          </span>
        )}
      </div>
    </div>
  );
}
