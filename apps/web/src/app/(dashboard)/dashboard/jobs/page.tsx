"use client";

import { useState, useEffect, useCallback } from "react";
import { JobCard } from "@/components/jobs/job-card";
import { LinkedInJobCard } from "@/components/jobs/linkedin-job-card";
import { JobFilters, FilterState } from "@/components/jobs/job-filters";
import { AdzunaJob } from "@/lib/adzuna";
import { LinkedInJob } from "@/lib/linkedin";
import { ChevronLeft, ChevronRight, Sparkles, Linkedin, Globe } from "lucide-react";
import { cn } from "@/lib/utils";

type JobWithScore = AdzunaJob & { matchScore: number };
type Source = "adzuna" | "linkedin";

export default function JobsPage() {
  const [source, setSource] = useState<Source>("adzuna");
  const [jobs, setJobs] = useState<JobWithScore[]>([]);
  const [linkedInJobs, setLinkedInJobs] = useState<LinkedInJob[]>([]);
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

  const fetchAdzunaJobs = useCallback(
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

  const fetchLinkedInJobs = useCallback(async () => {
    setLoading(true);
    setError(null);
    setLinkedInJobs([]);

    const params = new URLSearchParams();
    if (filters.what) params.set("title", filters.what);
    if (filters.where) params.set("location", filters.where);
    if (filters.contractTime === "full_time") params.set("contractType", "F");
    if (filters.contractTime === "part_time") params.set("contractType", "P");

    try {
      const res = await fetch(`/api/jobs/linkedin?${params}`);
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "LinkedIn search failed");

      setLinkedInJobs(data.jobs);
      setHasSearched(true);
    } catch (err: any) {
      setError(err.message || "LinkedIn search failed");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Load jobs on first visit
  useEffect(() => {
    fetchAdzunaJobs(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleSearch() {
    if (source === "adzuna") {
      fetchAdzunaJobs(1);
    } else {
      fetchLinkedInJobs();
    }
  }

  const totalPages = Math.ceil(totalCount / 12);

  return (
    <div className="max-w-4xl animate-fade-in">
      {/* Source toggle */}
      <div className="flex items-center gap-2 mb-5">
        <button
          onClick={() => setSource("adzuna")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border transition-all",
            source === "adzuna"
              ? "border-primary bg-primary-50 text-primary"
              : "border-border text-text-muted hover:border-primary-200"
          )}
        >
          <Globe size={15} />
          Job Boards
        </button>
        <button
          onClick={() => { setSource("linkedin"); if (linkedInJobs.length === 0) fetchLinkedInJobs(); }}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border transition-all",
            source === "linkedin"
              ? "border-[#0A66C2] bg-[#0A66C2]/5 text-[#0A66C2]"
              : "border-border text-text-muted hover:border-[#0A66C2]/40"
          )}
        >
          <Linkedin size={15} />
          LinkedIn
        </button>
        {source === "linkedin" && (
          <span className="text-xs text-text-muted ml-2">
            Takes 30-60 seconds to scrape fresh results
          </span>
        )}
      </div>

      {/* AI hint banner */}
      <div className="flex items-center gap-2 bg-primary-50 text-primary text-sm px-4 py-2.5 rounded-lg mb-5 font-medium">
        <Sparkles size={14} />
        <span>
          {source === "adzuna"
            ? "Jobs matched to your target role. Higher match = closer to what you need."
            : "Live results from LinkedIn. These are fresh listings scraped in real time."}
        </span>
      </div>

      {/* Filters */}
      <JobFilters
        filters={filters}
        onChange={setFilters}
        onSearch={handleSearch}
        loading={loading}
        totalCount={source === "adzuna" ? totalCount : linkedInJobs.length}
      />

      {/* Error */}
      {error && (
        <div className="card p-4 border-danger text-danger text-sm mb-4 font-medium">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="space-y-4">
          {source === "linkedin" && (
            <div className="card p-6 text-center">
              <div className="text-2xl mb-2">
                <Linkedin size={24} className="text-[#0A66C2] mx-auto" />
              </div>
              <p className="text-sm text-text-muted font-medium">
                Searching LinkedIn for fresh results...
              </p>
              <p className="text-xs text-text-muted mt-1">
                This usually takes 30-60 seconds
              </p>
            </div>
          )}
          {Array.from({ length: source === "linkedin" ? 3 : 6 }).map((_, i) => (
            <div key={i} className="card p-5 animate-pulse">
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

      {/* Adzuna Results */}
      {!loading && source === "adzuna" && jobs.length > 0 && (
        <>
          <div className="space-y-4">
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-8">
              <button
                onClick={() => fetchAdzunaJobs(page - 1)}
                disabled={page === 1 || loading}
                className="flex items-center gap-1 btn-ghost px-3 py-2 disabled:opacity-30"
              >
                <ChevronLeft size={16} /> Previous
              </button>
              <span className="text-sm text-text-muted font-medium">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => fetchAdzunaJobs(page + 1)}
                disabled={page >= totalPages || loading}
                className="flex items-center gap-1 btn-ghost px-3 py-2 disabled:opacity-30"
              >
                Next <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      )}

      {/* LinkedIn Results */}
      {!loading && source === "linkedin" && linkedInJobs.length > 0 && (
        <div className="space-y-4">
          {linkedInJobs.map((job, i) => (
            <LinkedInJobCard key={`${job.url}-${i}`} job={job} />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && hasSearched && (
        (source === "adzuna" && jobs.length === 0 && !error) ||
        (source === "linkedin" && linkedInJobs.length === 0 && !error)
      ) && (
        <div className="card p-12 text-center">
          <div className="text-4xl mb-4">
            {source === "linkedin" ? <Linkedin size={32} className="text-text-muted mx-auto" /> : null}
          </div>
          <h3 className="text-lg font-bold mb-2">No jobs found</h3>
          <p className="text-text-muted text-sm">
            Try different keywords or a broader location.
          </p>
        </div>
      )}
    </div>
  );
}
