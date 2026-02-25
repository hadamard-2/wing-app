import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { generateText } from "ai";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type StoredMessage = {
  role: string;
  content: string;
};

type PromptMessage = {
  role: "user" | "assistant";
  content: string;
};

type StoredConversation = {
  id: string;
  messages: StoredMessage[];
};

const MODEL_ID = "liquid/lfm-2.5-1.2b-instruct:free";

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
  compatibility: "compatible",
});

export async function POST(req: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const conversationId =
    typeof body?.conversationId === "string" ? body.conversationId : "";
  const content = typeof body?.content === "string" ? body.content.trim() : "";

  if (!conversationId) {
    return NextResponse.json(
      { error: "conversationId is required" },
      { status: 400 },
    );
  }

  if (!content) {
    return NextResponse.json({ error: "content is required" }, { status: 400 });
  }

  const aiConversation = (prisma as any).aIConversation;
  const aiMessage = (prisma as any).aIMessage;

  const conversation = (await aiConversation.findFirst({
    where: {
      id: conversationId,
      userId: session.user.id,
    },
    include: {
      messages: {
        orderBy: { createdAt: "asc" },
      },
    },
  })) as StoredConversation | null;

  if (!conversation) {
    return NextResponse.json(
      { error: "Conversation not found" },
      { status: 404 },
    );
  }

  const historyMessages: PromptMessage[] = conversation.messages
    .filter(
      (message: StoredMessage) =>
        (message.role === "user" || message.role === "assistant") &&
        message.content.trim().length > 0,
    )
    .map((message: StoredMessage) => ({
      role: message.role as "user" | "assistant",
      content: message.content.trim(),
    }));

  if (!process.env.OPENROUTER_API_KEY) {
    return NextResponse.json(
      { error: "OPENROUTER_API_KEY is not configured" },
      { status: 500 },
    );
  }

  const prompt = [
    "You are a helpful AI assistant.",
    "Respond in plain text only.",
    "Do not use markdown, code fences, bullet lists, headings, or tables.",
    "",
    "Conversation:",
    ...historyMessages.map(
      (message: PromptMessage) =>
        `${message.role === "user" ? "User" : "Assistant"}: ${message.content}`,
    ),
    `User: ${content}`,
    "",
    "Assistant:",
  ].join("\n");

  try {
    const userMessage = (await aiMessage.create({
      data: {
        role: "user",
        content,
        aiConversationId: conversation.id,
      },
    })) as { id: string; role: string; content: string; createdAt: Date };

    const result = await generateText({
      model: openrouter(MODEL_ID),
      prompt,
    });

    const assistantText = result.text.trim();

    const assistantMessage = (await aiMessage.create({
      data: {
        role: "assistant",
        content: assistantText,
        aiConversationId: conversation.id,
      },
    })) as { id: string; role: string; content: string; createdAt: Date };

    await aiConversation.update({
      where: { id: conversation.id },
      data: {
        title:
          conversation.messages.length === 0 ? content.slice(0, 40) : undefined,
      },
    });

    return NextResponse.json({
      text: assistantText,
      userMessage: {
        id: userMessage.id,
        role: userMessage.role,
        content: userMessage.content,
        createdAt: userMessage.createdAt.toISOString(),
      },
      assistantMessage: {
        id: assistantMessage.id,
        role: assistantMessage.role,
        content: assistantMessage.content,
        createdAt: assistantMessage.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("AI response failed:", error);
    return NextResponse.json(
      { error: "Failed to generate AI response" },
      { status: 500 },
    );
  }
}
