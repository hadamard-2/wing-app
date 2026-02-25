import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { generateText } from "ai";
import { auth } from "@/lib/auth";

const MODEL_ID = "liquid/lfm-2.5-1.2b-instruct:free";

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
  compatibility: "compatible",
});

type ClientMessage = {
  role: "user" | "assistant";
  content: string;
};

export async function POST(req: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const messages = (body?.messages ?? []) as ClientMessage[];

  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json(
      { error: "Messages are required" },
      { status: 400 },
    );
  }

  const normalizedMessages = messages
    .filter(
      (message) =>
        (message.role === "user" || message.role === "assistant") &&
        typeof message.content === "string" &&
        message.content.trim().length > 0,
    )
    .map((message) => ({
      role: message.role,
      content: message.content.trim(),
    }));

  if (normalizedMessages.length === 0) {
    return NextResponse.json(
      { error: "At least one valid message is required" },
      { status: 400 },
    );
  }

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
    ...normalizedMessages.map(
      (message) =>
        `${message.role === "user" ? "User" : "Assistant"}: ${message.content}`,
    ),
    "",
    "Assistant:",
  ].join("\n");

  try {
    const result = await generateText({
      model: openrouter(MODEL_ID),
      prompt,
    });

    return NextResponse.json({ text: result.text });
  } catch (error) {
    console.error("AI response failed:", error);
    return NextResponse.json(
      { error: "Failed to generate AI response" },
      { status: 500 },
    );
  }
}
