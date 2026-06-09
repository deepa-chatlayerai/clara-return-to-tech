import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET — fetch all applications for current user
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const applications = await prisma.jobApplication.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json({ applications });
}

// POST — manually add a new application
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { jobTitle, company, location, jobUrl, salary, notes, status } =
    await req.json();

  if (!jobTitle || !company) {
    return NextResponse.json(
      { error: "Job title and company are required" },
      { status: 400 },
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
      notes,
      status: status || "SAVED",
    },
  });

  return NextResponse.json({ application }, { status: 201 });
}
