import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { searchJobs, calculateMatchScore } from "@/lib/adzuna";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const what = searchParams.get("what") || "";
  const where = searchParams.get("where") || "Belgium";
  const page = parseInt(searchParams.get("page") || "1");
  const contractTime = searchParams.get("contractTime") as
    | "full_time"
    | "part_time"
    | null;
  const salaryMin = searchParams.get("salaryMin")
    ? parseInt(searchParams.get("salaryMin")!)
    : undefined;

  // Get user profile for match scoring
  const profile = await prisma.userProfile.findUnique({
    where: { userId: session.user.id },
  });

  try {
    const data = await searchJobs({
      what: what || profile?.targetRole || "developer",
      where,
      page,
      contractTime: contractTime || undefined,
      salaryMin,
    });

    // Add match scores to results
    const resultsWithScores = data.results.map((job) => ({
      ...job,
      matchScore: calculateMatchScore(
        job,
        profile?.targetRole,
        profile?.skills,
      ),
    }));

    // Sort by match score descending
    resultsWithScores.sort((a, b) => b.matchScore - a.matchScore);

    return NextResponse.json({
      jobs: resultsWithScores,
      count: data.count,
      page,
    });
  } catch (error) {
    console.error("Job search error:", error);
    return NextResponse.json(
      { error: "Failed to fetch jobs. Please try again." },
      { status: 500 },
    );
  }
}
