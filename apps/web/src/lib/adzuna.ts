export interface AdzunaJob {
  id: string;
  title: string;
  company: { display_name: string };
  location: { display_name: string; area: string[] };
  description: string;
  redirect_url: string;
  salary_min?: number;
  salary_max?: number;
  contract_time?: string; // "full_time" | "part_time"
  contract_type?: string; // "permanent" | "contract"
  created: string;
  category: { label: string };
}

export interface AdzunaResponse {
  results: AdzunaJob[];
  count: number;
  mean: number;
}

export interface JobSearchParams {
  what?: string; // keywords e.g. "react developer"
  where?: string; // location e.g. "Brussels"
  page?: number;
  resultsPerPage?: number;
  contractTime?: "full_time" | "part_time";
  salaryMin?: number;
}

export async function searchJobs(
  params: JobSearchParams,
): Promise<AdzunaResponse> {
  const appId = process.env.ADZUNA_APP_ID;
  const appKey = process.env.ADZUNA_APP_KEY;

  if (!appId || !appKey) {
    throw new Error("Adzuna API credentials not configured");
  }

  const page = params.page || 1;
  const resultsPerPage = params.resultsPerPage || 12;

  const url = new URL(`https://api.adzuna.com/v1/api/jobs/be/search/${page}`);

  url.searchParams.set("app_id", appId);
  url.searchParams.set("app_key", appKey);
  url.searchParams.set("results_per_page", String(resultsPerPage));

  if (params.what) url.searchParams.set("what", params.what);
  if (params.where) url.searchParams.set("where", params.where);
  if (params.contractTime)
    url.searchParams.set("contract_time", params.contractTime);
  if (params.salaryMin)
    url.searchParams.set("salary_min", String(params.salaryMin));

  const res = await fetch(url.toString(), {
    next: { revalidate: 300 },
  });

  if (!res.ok) {
    const errorBody = await res.text();
    console.error("Adzuna error response:", res.status, errorBody);
    throw new Error(`Adzuna API error: ${res.status} - ${errorBody}`);
  }

  return res.json();
}

// Calculate a simple match score between a job and user's target role/skills
export function calculateMatchScore(
  job: AdzunaJob,
  targetRole?: string | null,
  skills?: string[],
): number {
  if (!targetRole) return 0;

  const jobText = `${job.title} ${job.description}`.toLowerCase();
  const roleWords = targetRole.toLowerCase().split(/\s+/);
  const skillList = skills || [];

  let score = 0;
  let total = roleWords.length + skillList.length;

  // Score role words
  for (const word of roleWords) {
    if (word.length > 2 && jobText.includes(word)) score++;
  }

  // Score skills
  for (const skill of skillList) {
    if (jobText.includes(skill.toLowerCase())) score++;
  }

  if (total === 0) return 0;
  return Math.min(Math.round((score / total) * 100), 99);
}

export function formatSalary(min?: number, max?: number): string | null {
  if (!min && !max) return null;
  const fmt = (n: number) =>
    n >= 1000 ? `€${Math.round(n / 1000)}k` : `€${n}`;
  if (min && max) return `${fmt(min)} – ${fmt(max)}`;
  if (min) return `${fmt(min)}+`;
  if (max) return `up to ${fmt(max)}`;
  return null;
}

export function timeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffHours < 1) return "Just posted";
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return `${Math.floor(diffDays / 7)}w ago`;
}
