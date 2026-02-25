import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type ConversationDetail = {
  id: string;
  title: string;
  updatedAt: Date;
  messages: {
    id: string;
    role: string;
    content: string;
    createdAt: Date;
  }[];
};

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const aiConversation = (prisma as any).aIConversation;
  const conversation = (await aiConversation.findFirst({
    where: {
      id,
      userId: session.user.id,
    },
    include: {
      messages: {
        orderBy: { createdAt: "asc" },
      },
    },
  })) as ConversationDetail | null;

  if (!conversation) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    id: conversation.id,
    title: conversation.title,
    updatedAt: conversation.updatedAt.toISOString(),
    messages: conversation.messages.map((message) => ({
      id: message.id,
      role: message.role,
      content: message.content,
      createdAt: message.createdAt.toISOString(),
    })),
  });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const aiConversation = (prisma as any).aIConversation;
  const conversation = (await aiConversation.findFirst({
    where: {
      id,
      userId: session.user.id,
    },
    select: { id: true },
  })) as { id: string } | null;

  if (!conversation) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    await aiConversation.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete AI conversation:", error);
    return NextResponse.json(
      { error: "Failed to delete AI conversation" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const rawTitle = typeof body?.title === "string" ? body.title.trim() : "";

  if (!rawTitle) {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  }

  const title = rawTitle.slice(0, 80);
  const aiConversation = (prisma as any).aIConversation;
  const conversation = (await aiConversation.findFirst({
    where: {
      id,
      userId: session.user.id,
    },
    select: { id: true },
  })) as { id: string } | null;

  if (!conversation) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const updated = (await aiConversation.update({
      where: { id },
      data: { title },
      select: { id: true, title: true, updatedAt: true },
    })) as { id: string; title: string; updatedAt: Date };

    return NextResponse.json({
      id: updated.id,
      title: updated.title,
      updatedAt: updated.updatedAt.toISOString(),
    });
  } catch (error) {
    console.error("Failed to rename AI conversation:", error);
    return NextResponse.json(
      { error: "Failed to rename AI conversation" },
      { status: 500 },
    );
  }
}
