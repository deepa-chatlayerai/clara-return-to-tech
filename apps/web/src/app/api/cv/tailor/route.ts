import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { cvContent, jobDescription, jobTitle, company } = await req.json();

  if (!cvContent || !jobDescription) {
    return NextResponse.json(
      { error: "CV content and job description are required" },
      { status: 400 },
    );
  }

  // Get user profile for context
  const profile = await prisma.userProfile.findUnique({
    where: { userId: session.user.id },
    select: {
      careerGapYears: true,
      careerGapReason: true,
      targetRole: true,
      currentLocation: true,
    },
  });

  const gapContext =
    profile?.careerGapYears && profile.careerGapYears > 0
      ? `The user has a career gap of approximately ${profile.careerGapYears} years${
          profile.careerGapReason
            ? ` due to ${profile.careerGapReason}`
            : " (family/personal reasons)"
        }. This gap should be reframed positively — not hidden, but presented as a period of intentional choice and continued development.`
      : "";

  const prompt = `You are an expert CV writer and career coach specialising in helping women return to tech after career breaks.

Your task is to tailor the following CV for a specific job, while being honest and empowering about the candidate's full story.

${gapContext}

## Original CV:
${cvContent}

## Job Description:
${jobDescription}

## Instructions:
1. Rewrite the CV professional summary to directly match this role at ${company || "the company"}
2. Highlight skills and experience most relevant to the job description
3. Add keywords from the job description naturally throughout
4. If there is a career gap, reframe it warmly and honestly — e.g. "2018–2025: Career break for family, during which I maintained technical skills through self-directed learning and personal projects including [projects if mentioned]"
5. Keep all experience honest — do not invent anything
6. Make bullet points achievement-focused with impact where possible
7. Keep the tone confident and professional, not apologetic

## Output format:
Return ONLY the tailored CV text, ready to use. Use clear sections with headers. Do not add commentary or explanations outside the CV itself.`;

  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2000,
      messages: [{ role: "user", content: prompt }],
    });

    const tailoredContent =
      message.content[0].type === "text" ? message.content[0].text : "";

    // Also generate a brief analysis
    const analysisPrompt = `Based on this job description and the tailored CV, provide a brief analysis in JSON format with these fields:
- matchKeywords: array of 5-8 key skills/keywords found in both CV and job description
- missingKeywords: array of 3-5 important keywords from job description not strongly in CV  
- gapReframe: one sentence on how the career gap was reframed (or null if no gap)
- matchScore: estimated match percentage 0-100

Job description: ${jobDescription.slice(0, 500)}
Tailored CV summary section: ${tailoredContent.slice(0, 500)}

Return only valid JSON.`;

    const analysisMessage = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 400,
      messages: [{ role: "user", content: analysisPrompt }],
    });

    let analysis = null;
    try {
      const analysisText =
        analysisMessage.content[0].type === "text"
          ? analysisMessage.content[0].text
          : "{}";
      analysis = JSON.parse(analysisText);
    } catch {
      // Analysis is optional, don't fail if it doesn't parse
    }

    return NextResponse.json({
      tailoredContent,
      analysis,
    });
  } catch (error) {
    console.error("Claude API error:", error);
    return NextResponse.json(
      { error: "AI tailoring failed. Please try again." },
      { status: 500 },
    );
  }
}
