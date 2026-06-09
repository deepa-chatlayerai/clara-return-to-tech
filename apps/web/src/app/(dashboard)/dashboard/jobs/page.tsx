"use client";

import { useState, useEffect, useCallback } from "react";
import { JobCard } from "@/components/jobs/job-card";
import { JobFilters, FilterState } from "@/components/jobs/job-filters";
import { AdzunaJob } from "@/lib/adzuna";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";

type JobWithScore = AdzunaJob & { matchScore: number };

export default function JobsPage() {
  const [jobs, setJobs] = useState<JobWithScore[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [hasSearched, setHasSearched] = useState(false);

  const [filters, setFilters] = useState<FilterState>({
    what: "",
    where: "Belgium",
    contractTime: "",
    salaryMin: "",
  });

  const fetchJobs = useCallback(
    async (currentPage = 1) => {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: String(currentPage),
        where: filters.where || "Belgium",
      });
      if (filters.what) params.set("what", filters.what);
      if (filters.contractTime) params.set("contractTime", filters.contractTime);
      if (filters.salaryMin) params.set("salaryMin", filters.salaryMin);

      try {
        const res = await fetch(`/api/jobs/search?${params}`);
        const data = await res.json();

        if (!res.ok) throw new Error(data.error || "Search failed");

        setJobs(data.jobs);
        setTotalCount(data.count);
        setPage(currentPage);
        setHasSearched(true);
      } catch (err: any) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    },
    [filters]
  );

  // Load jobs on first visit using profile defaults
  useEffect(() => {
    fetchJobs(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totalPages = Math.ceil(totalCount / 12);

  return (
    <div className="max-w-4xl animate-fade-in">
      {/* AI hint banner */}
      <div className="flex items-center gap-2 bg-primary-50 text-primary text-sm px-4 py-2.5 rounded-lg mb-5">
        <Sparkles size={14} />
        <span>
          Jobs are matched to your target role. Higher match % = closer to what you're aiming for.
        </span>
      </div>

      {/* Filters */}
      <JobFilters
        filters={filters}
        onChange={setFilters}
        onSearch={() => fetchJobs(1)}
        loading={loading}
        totalCount={totalCount}
      />

      {/* Error */}
      {error && (
        <div className="card p-4 border-danger text-danger text-sm mb-4">
          {error}
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="card p-5 animate-pulse"
            >
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-border rounded-lg" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-border rounded w-1/2" />
                  <div className="h-3 bg-border rounded w-1/4" />
                  <div className="h-3 bg-border rounded w-3/4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Results */}
      {!loading && jobs.length > 0 && (
        <>
          <div className="space-y-4">
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-8">
              <button
                onClick={() => fetchJobs(page - 1)}
                disabled={page === 1 || loading}
                className="flex items-center gap-1 btn-ghost px-3 py-2 disabled:opacity-30"
              >
                <ChevronLeft size={16} /> Previous
              </button>
              <span className="text-sm text-text-muted">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => fetchJobs(page + 1)}
                disabled={page >= totalPages || loading}
                className="flex items-center gap-1 btn-ghost px-3 py-2 disabled:opacity-30"
              >
                Next <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      )}

      {/* Empty state */}
      {!loading && hasSearched && jobs.length === 0 && !error && (
        <div className="card p-12 text-center">
          <div className="text-4xl mb-4">🔍</div>
          <h3 className="font-heading text-lg font-semibold mb-2">No jobs found</h3>
          <p className="text-text-muted text-sm">
            Try different keywords or a broader location like "Belgium".
          </p>
        </div>
      )}
    </div>
  );
}
