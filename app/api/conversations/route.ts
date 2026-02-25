import { headers } from "next/headers";
import { NextResponse, NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const conversations = await prisma.conversation.findMany({
    where: { participants: { some: { userId: session.user.id } } },
    include: {
      participants: {
        include: {
          user: { select: { id: true, name: true, email: true, image: true } },
        },
      },
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });

  conversations.sort((a, b) => {
    const aTime = a.messages[0]?.createdAt.getTime() ?? 0;
    const bTime = b.messages[0]?.createdAt.getTime() ?? 0;
    return bTime - aTime;
  });

  return NextResponse.json(
    conversations
      .map((c) => {
        const otherUser = c.participants.find(
          (p) => p.userId !== session.user.id,
        )?.user;
        if (!otherUser) return null;
        const lastMsg = c.messages[0];
        return {
          id: c.id,
          user: {
            id: otherUser.id,
            name: otherUser.name,
            email: otherUser.email,
            image: otherUser.image,
          },
          lastMessage: lastMsg?.content ?? null,
          lastMessageTime: lastMsg?.createdAt.toISOString() ?? null,
          lastMessageSenderId: lastMsg?.senderId ?? null,
        };
      })
      .filter((conversation) => conversation !== null),
  );
}

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
