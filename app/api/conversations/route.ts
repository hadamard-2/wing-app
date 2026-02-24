import { headers } from "next/headers";
import { NextResponse, NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { userId } = await req.json();

  const existing = await prisma.conversation.findFirst({
    where: {
      AND: [
        { participants: { some: { userId: session.user.id } } },
        { participants: { some: { userId } } },
      ],
    },
    include: {
      messages: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (existing) {
    return NextResponse.json({
      id: existing.id,
      messages: existing.messages.map((m) => ({
        id: m.id,
        content: m.content,
        senderId: m.senderId,
        conversationId: existing.id,
        createdAt: m.createdAt.toISOString(),
      })),
    });
  }

  const conversation = await prisma.conversation.create({
    data: {
      participants: {
        create: [{ userId: session.user.id }, { userId }],
      },
    },
  });

  return NextResponse.json({ id: conversation.id, messages: [] });
}
