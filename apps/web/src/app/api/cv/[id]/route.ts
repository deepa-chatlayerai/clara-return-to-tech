import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cv = await prisma.cV.findUnique({ where: { id: params.id } });
  if (!cv || cv.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { name, content, isActive } = await req.json();

  if (isActive) {
    await prisma.cV.updateMany({
      where: { userId: session.user.id },
      data: { isActive: false },
    });
  }

  const updated = await prisma.cV.update({
    where: { id: params.id },
    data: {
      ...(name && { name }),
      ...(content && { content }),
      ...(isActive !== undefined && { isActive }),
    },
  });

  return NextResponse.json({ cv: updated });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cv = await prisma.cV.findUnique({ where: { id: params.id } });
  if (!cv || cv.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.cV.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
