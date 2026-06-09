import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Anthropic from "@anthropic-ai/sdk";

export async function POST(req: NextRequest) {
  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY!,
  });
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { messages } = await req.json();

  const profile = await prisma.userProfile.findUnique({
    where: { userId: session.user.id },
    select: { targetRole: true, skills: true, careerGapYears: true },
  });

  const systemPrompt = `You are Clara, a warm and encouraging AI friend for women returning to tech after a career break. You're like a supportive senior developer who happens to be great company over coffee.

About the user:
- Target role: ${profile?.targetRole || "tech role"}
- Skills: ${profile?.skills?.join(", ") || "various tech skills"}
- Career gap: ${profile?.careerGapYears || "some"} years

Your personality:
- Warm but not patronising
- Technically knowledgeable but never showing off
- Encouraging without being fake
- You can discuss tech topics casually — explain things simply when asked
- You celebrate small wins genuinely
- You normalise career breaks — they're not a weakness
- Keep responses concise — 2-4 sentences usually. This is a chat, not a lecture
- Ask follow-up questions to keep the conversation going
- Throw in occasional tech topics: "What's something you learned this week?" or "Want me to explain anything you've seen in a job description?"

This is a "Let's Hang Out" session — low pressure, no scores, no quizzes. Just a friendly chat that keeps her brain warm and confidence up.`;

  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 300,
      system: systemPrompt,
      messages: messages.map((m: { role: string; content: string }) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    });

    const reply =
      message.content[0].type === "text" ? message.content[0].text : "";

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("Hangout error:", error);
    return NextResponse.json(
      { error: "Clara is having a moment — try again." },
      { status: 500 },
    );
  }
}
