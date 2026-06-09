import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET — fetch all CVs for current user
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cvs = await prisma.cV.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json({ cvs });
}

// POST — save a new CV version
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, content, tailoredFor, isActive } = await req.json();

  if (!name || !content) {
    return NextResponse.json(
      { error: "Name and content are required" },
      { status: 400 },
    );
  }

  // If setting as active, deactivate others
  if (isActive) {
    await prisma.cV.updateMany({
      where: { userId: session.user.id },
      data: { isActive: false },
    });
  }

  const cv = await prisma.cV.create({
    data: {
      userId: session.user.id,
      name,
      content,
      tailoredFor: tailoredFor || null,
      isActive: isActive || false,
    },
  });

  return NextResponse.json({ cv }, { status: 201 });
}
