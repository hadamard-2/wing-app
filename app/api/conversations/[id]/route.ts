import { headers } from "next/headers";
import { NextResponse, NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getSocketServer } from "@/lib/socket-server";

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

  const conversation = await prisma.conversation.findFirst({
    where: {
      id,
      participants: { some: { userId: session.user.id } },
    },
    select: {
      id: true,
      participants: {
        select: {
          userId: true,
        },
      },
    },
  });

  if (!conversation) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    await prisma.$transaction([
      prisma.message.deleteMany({ where: { conversationId: id } }),
      prisma.conversationParticipant.deleteMany({
        where: { conversationId: id },
      }),
      prisma.conversation.delete({ where: { id } }),
    ]);

    const io = getSocketServer();
    if (io) {
      for (const participant of conversation.participants) {
        io.to(participant.userId).emit("conversation_deleted", {
          conversationId: id,
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete conversation:", error);
    return NextResponse.json(
      { error: "Failed to delete conversation" },
      { status: 500 },
    );
  }
}
