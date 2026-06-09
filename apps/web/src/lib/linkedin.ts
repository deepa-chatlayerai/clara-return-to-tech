export interface LinkedInJob {
  title: string;
  company: string;
  location: string;
  url: string;
  date: string;
  description?: string;
  salary?: string;
  contractType?: string;
  experienceLevel?: string;
  remote?: string;
}

export interface LinkedInSearchParams {
  title?: string;
  location?: string;
  limit?: number;
  datePosted?: "r86400" | "r604800" | "r2592000"; // 24h, 7 days, 30 days
  contractType?: string[]; // "F" = full-time, "P" = part-time, "C" = contract
  remote?: string[]; // "2" = remote, "3" = hybrid, "1" = on-site
}

export async function searchLinkedInJobs(
  params: LinkedInSearchParams,
): Promise<LinkedInJob[]> {
  const token = process.env.APIFY_TOKEN;

  if (!token) {
    throw new Error("Apify token not configured");
  }

  const input: Record<string, any> = {
    limit: params.limit || 20,
  };

  if (params.title) input.title = params.title;
  if (params.location) input.location = params.location;
  if (params.datePosted) input.datePosted = params.datePosted;
  if (params.contractType) input.contractType = params.contractType;
  if (params.remote) input.remote = params.remote;

  // Run the actor synchronously and get dataset items
  const res = await fetch(
    `https://api.apify.com/v2/acts/valig~linkedin-jobs-scraper/run-sync-get-dataset-items?token=${token}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    },
  );

  if (!res.ok) {
    const errorBody = await res.text();
    console.error("Apify error:", res.status, errorBody);
    throw new Error(`LinkedIn scraper error: ${res.status}`);
  }

  const rawJobs = await res.json();

  // Normalize the response format
  return rawJobs.map((job: any) => ({
    title: job.title || job.jobTitle || "",
    company: job.company || job.companyName || "",
    location: job.location || "",
    url: job.url || job.link || job.jobUrl || "",
    date: job.date || job.postedDate || job.publishedAt || "",
    description: job.description || "",
    salary: job.salary || null,
    contractType: job.contractType || job.employmentType || null,
    experienceLevel: job.experienceLevel || null,
    remote: job.remote || job.workType || null,
  }));
}
