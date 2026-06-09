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

  const { topic } = await req.json();

  const profile = await prisma.userProfile.findUnique({
    where: { userId: session.user.id },
    select: { targetRole: true, skills: true },
  });

  const quizTopic = topic || profile?.targetRole || "web development";

  const prompt = `Generate a 5-question multiple choice quiz about "${quizTopic}" for someone returning to tech after a career break. Make it practical and relevant to job interviews.

Return JSON in this exact format:
{
  "topic": "${quizTopic}",
  "questions": [
    {
      "id": 1,
      "question": "the question text",
      "options": ["A) option", "B) option", "C) option", "D) option"],
      "correctIndex": 0,
      "explanation": "short explanation of why this is correct"
    }
  ]
}

Rules:
- Questions should be intermediate difficulty, not trick questions
- Relevant to real-world job interviews and daily work
- Explanations should be short and educational (1-2 sentences)
- Return ONLY valid JSON, no markdown or extra text`;

  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1500,
      messages: [{ role: "user", content: prompt }],
    });

    const text =
      message.content[0].type === "text" ? message.content[0].text : "{}";
    // Strip markdown code fences if present
    const cleaned = text
      .replace(/^```(?:json)?\s*\n?/i, "")
      .replace(/\n?```\s*$/i, "")
      .trim();
    const quiz = JSON.parse(cleaned);

    return NextResponse.json(quiz);
  } catch (error) {
    console.error("Quiz generation error:", error);
    return NextResponse.json(
      { error: "Couldn't generate quiz. Try again." },
      { status: 500 },
    );
  }
}
