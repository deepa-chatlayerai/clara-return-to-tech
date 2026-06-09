import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PracticeType } from "@prisma/client";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { type, topic, score, durationMin } = await req.json();

  // Save practice session
  await prisma.practiceSession.create({
    data: {
      userId: session.user.id,
      type: type as PracticeType,
      topic,
      score,
      durationMin,
    },
  });

  // Update streak
  const streak = await prisma.streak.findUnique({
    where: { userId: session.user.id },
  });

  if (streak) {
    const now = new Date();
    const lastActive = new Date(streak.lastActiveAt);
    const hoursSince =
      (now.getTime() - lastActive.getTime()) / (1000 * 60 * 60);

    let newStreak = streak.currentStreak;

    if (hoursSince > 48) {
      // Streak broken (we're kind — 48 hours not 24)
      newStreak = 1;
    } else if (hoursSince > 12) {
      // New day, increment
      newStreak = streak.currentStreak + 1;
    }
    // If less than 12 hours, same day — no change

    await prisma.streak.update({
      where: { userId: session.user.id },
      data: {
        currentStreak: newStreak,
        longestStreak: Math.max(newStreak, streak.longestStreak),
        lastActiveAt: now,
      },
    });

    return NextResponse.json({
      streak: newStreak,
      isNewDay: hoursSince > 12,
    });
  }

  return NextResponse.json({ streak: 1, isNewDay: true });
}
