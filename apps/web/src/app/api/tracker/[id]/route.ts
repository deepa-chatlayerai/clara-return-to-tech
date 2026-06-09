import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// PATCH — update status, notes, interview date
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const application = await prisma.jobApplication.findUnique({
    where: { id: params.id },
  });

  if (!application || application.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { status, notes, interviewAt } = await req.json();

  const updated = await prisma.jobApplication.update({
    where: { id: params.id },
    data: {
      ...(status && { status }),
      ...(notes !== undefined && { notes }),
      ...(interviewAt !== undefined && {
        interviewAt: interviewAt ? new Date(interviewAt) : null,
      }),
      ...(status === "APPLIED" &&
        !application.appliedAt && {
          appliedAt: new Date(),
        }),
    },
  });

  return NextResponse.json({ application: updated });
}

// DELETE — remove an application
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const application = await prisma.jobApplication.findUnique({
    where: { id: params.id },
  });

  if (!application || application.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.jobApplication.delete({ where: { id: params.id } });

  return NextResponse.json({ ok: true });
}
