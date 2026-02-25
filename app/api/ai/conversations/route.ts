import { headers } from "next/headers";
import { NextResponse, NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type ConversationListItem = {
  id: string;
  title: string;
  updatedAt: Date;
  messages: { content: string }[];
};

export async function GET() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const aiConversation = (prisma as any).aIConversation;
  const conversations = (await aiConversation.findMany({
    where: { userId: session.user.id },
    include: {
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
    orderBy: { updatedAt: "desc" },
  })) as ConversationListItem[];

  return NextResponse.json(
    conversations.map((conversation: ConversationListItem) => ({
      id: conversation.id,
      title: conversation.title,
      updatedAt: conversation.updatedAt.toISOString(),
      lastMessage: conversation.messages[0]?.content ?? null,
    })),
  );
}

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const rawTitle = typeof body?.title === "string" ? body.title.trim() : "";
  const title = rawTitle || "New AI chat";

  const aiConversation = (prisma as any).aIConversation;
  const conversation = (await aiConversation.create({
    data: {
      title,
      userId: session.user.id,
    },
  })) as { id: string; title: string; updatedAt: Date };

  return NextResponse.json({
    id: conversation.id,
    title: conversation.title,
    updatedAt: conversation.updatedAt.toISOString(),
    messages: [],
  });
}
