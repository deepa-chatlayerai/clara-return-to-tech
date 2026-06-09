import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { jobTitle, company, location, jobUrl, salary, matchScore } =
    await req.json();

  if (!jobTitle || !company) {
    return NextResponse.json(
      { error: "Job title and company are required" },
      { status: 400 },
    );
  }

  // Check if already saved
  const existing = await prisma.jobApplication.findFirst({
    where: {
      userId: session.user.id,
      jobUrl,
    },
  });

  if (existing) {
    return NextResponse.json(
      { error: "Already saved", application: existing },
      { status: 409 },
    );
  }

  const application = await prisma.jobApplication.create({
    data: {
      userId: session.user.id,
      jobTitle,
      company,
      location,
      jobUrl,
      salary,
      matchScore,
      status: "SAVED",
    },
  });

  return NextResponse.json({ application }, { status: 201 });
}
