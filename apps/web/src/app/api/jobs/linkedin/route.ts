import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { searchLinkedInJobs } from "@/lib/linkedin";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const title = searchParams.get("title") || "";
  const location = searchParams.get("location") || "";
  const datePosted = searchParams.get("datePosted") as
    | "r86400"
    | "r604800"
    | "r2592000"
    | null;
  const contractType = searchParams.get("contractType"); // "F" or "P"
  const remote = searchParams.get("remote"); // "2" or "3"
  const limit = parseInt(searchParams.get("limit") || "20");

  // Get user profile for defaults
  const profile = await prisma.userProfile.findUnique({
    where: { userId: session.user.id },
    select: { targetRole: true, currentLocation: true },
  });

  try {
    const jobs = await searchLinkedInJobs({
      title: title || profile?.targetRole || "developer",
      location: location || profile?.currentLocation || "Belgium",
      limit: Math.min(limit, 50),
      datePosted: datePosted || "r604800", // default: last 7 days
      contractType: contractType ? [contractType] : undefined,
      remote: remote ? [remote] : undefined,
    });

    return NextResponse.json({
      jobs,
      count: jobs.length,
      source: "linkedin",
    });
  } catch (error: any) {
    console.error("LinkedIn search error:", error);
    return NextResponse.json(
      { error: error.message || "LinkedIn search failed. Please try again." },
      { status: 500 },
    );
  }
}
