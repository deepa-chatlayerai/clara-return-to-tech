import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { targetRole, currentLocation, careerGapYears } = await req.json();

  await prisma.userProfile.upsert({
    where: { userId: session.user.id },
    update: {
      targetRole,
      currentLocation,
      careerGapYears: parseInt(careerGapYears) || null,
      onboardingDone: true,
    },
    create: {
      userId: session.user.id,
      targetRole,
      currentLocation,
      careerGapYears: parseInt(careerGapYears) || null,
      onboardingDone: true,
    },
  });

  return NextResponse.json({ ok: true });
}
