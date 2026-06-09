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

  const { type } = await req.json(); // "code" | "debug" | "logic"

  const profile = await prisma.userProfile.findUnique({
    where: { userId: session.user.id },
    select: { targetRole: true, skills: true },
  });

  const puzzleType = type || "code";
  const skills = profile?.skills?.join(", ") || "JavaScript, React";

  const prompts: Record<string, string> = {
    code: `Generate a short coding puzzle suitable for someone returning to web development. Use ${skills}. 

Return JSON:
{
  "type": "code",
  "title": "short title",
  "description": "problem statement in 2-3 sentences",
  "starterCode": "// starter code with blanks or TODO",
  "solution": "the correct solution",
  "explanation": "1-2 sentence explanation",
  "difficulty": "easy" or "medium"
}

Keep it achievable in 5-10 minutes. Think practical, real-world, not algorithm puzzles.`,

    debug: `Generate a "spot the bug" puzzle for a web developer. Use ${skills}.

Return JSON:
{
  "type": "debug",
  "title": "short title",
  "description": "This code has a bug. Can you find it?",
  "buggyCode": "code with a subtle but common bug",
  "fixedCode": "the corrected version",
  "explanation": "what the bug was and why it's common",
  "difficulty": "easy" or "medium"
}

Use common real-world bugs that someone might encounter in a job. Not obscure tricks.`,

    logic: `Generate a short logic/problem-solving puzzle suitable for a tech interview warm-up.

Return JSON:
{
  "type": "logic",
  "title": "short title",
  "description": "the puzzle scenario",
  "hint": "a subtle hint",
  "answer": "the solution",
  "explanation": "reasoning explained simply",
  "difficulty": "easy" or "medium"
}

Keep it fun and achievable in 3-5 minutes. Think creative problem solving, not math.`,
  };

  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 800,
      messages: [
        {
          role: "user",
          content: `${prompts[puzzleType] || prompts.code}\n\nReturn ONLY valid JSON.`,
        },
      ],
    });

    const text =
      message.content[0].type === "text" ? message.content[0].text : "{}";
    // Strip markdown code fences if present
    const cleaned = text
      .replace(/^```(?:json)?\s*\n?/i, "")
      .replace(/\n?```\s*$/i, "")
      .trim();
    const puzzle = JSON.parse(cleaned);

    return NextResponse.json(puzzle);
  } catch (error) {
    console.error("Puzzle generation error:", error);
    return NextResponse.json(
      { error: "Couldn't generate puzzle. Try again." },
      { status: 500 },
    );
  }
}
