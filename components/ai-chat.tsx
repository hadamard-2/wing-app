"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Bot,
  Mic,
  MoreHorizontal,
  Paperclip,
  Plus,
  Search,
  Send,
  Smile,
} from "lucide-react";

type AIMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
};

type AIConversation = {
  id: string;
  title: string;
  messages: AIMessage[];
  updatedAt: string;
};

function makeId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random()}`;
}

function formatRelativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

function IconButton({
  icon: Icon,
  onClick,
  className = "",
  disabled = false,
}: {
  icon: React.ElementType;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-10 h-10 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 ${className}`}
    >
      <Icon className="w-5 h-5" />
    </button>
  );
}

function AIHistoryItem({
  title,
  preview,
  updatedAt,
  isActive,
  onClick,
}: {
  title: string;
  preview: string;
  updatedAt: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-3 rounded-2xl transition-colors ${
        isActive ? "bg-[#F3F3EE]" : "hover:bg-gray-50"
      }`}
    >
      <div className="flex items-center justify-between gap-2 mb-1">
        <h3 className="font-semibold text-gray-900 truncate">{title}</h3>
        <span className="text-xs text-gray-400 whitespace-nowrap">
          {formatRelativeTime(updatedAt)}
        </span>
      </div>
      <p className="text-sm text-gray-500 truncate">{preview}</p>
    </button>
  );
}

function UserMessage({ text, time }: { text: string; time: string }) {
  return (
    <div className="flex flex-col gap-2 max-w-md self-end items-end">
      <div className="bg-[#F0FDF4] p-4 rounded-xl text-gray-800 w-fit">
        {text}
      </div>
      <span className="text-xs text-gray-400 mr-1">{time}</span>
    </div>
  );
}

function AssistantMessage({ text, time }: { text: string; time: string }) {
  return (
    <div className="flex flex-col gap-2 max-w-md">
      <div className="bg-white p-4 rounded-xl text-gray-800 w-fit">{text}</div>
      <span className="text-xs text-gray-400 ml-1">{time}</span>
    </div>
  );
}

export function AIChat() {
  const [conversations, setConversations] = useState<AIConversation[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(null);
  const [input, setInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [typingDots, setTypingDots] = useState(".");
  const [search, setSearch] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const selectedConversation = useMemo(
    () =>
      conversations.find(
        (conversation) => conversation.id === selectedConversationId,
      ) || null,
    [conversations, selectedConversationId],
  );

  const filteredConversations = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return conversations;
    return conversations.filter((conversation) => {
      const latest =
        conversation.messages[conversation.messages.length - 1]?.content || "";
      return (
        conversation.title.toLowerCase().includes(query) ||
        latest.toLowerCase().includes(query)
      );
    });
  }, [conversations, search]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedConversation?.messages, isGenerating]);

  useEffect(() => {
    if (!isGenerating) {
      setTypingDots(".");
      return;
    }

    const interval = window.setInterval(() => {
      setTypingDots((current) => {
        if (current.length >= 3) return ".";
        return `${current}.`;
      });
    }, 350);

    return () => window.clearInterval(interval);
  }, [isGenerating]);

  function startNewChat() {
    const now = new Date().toISOString();
    const conversationId = makeId();
    const newConversation: AIConversation = {
      id: conversationId,
      title: "New AI chat",
      messages: [],
      updatedAt: now,
    };

    setConversations((prev) => [newConversation, ...prev]);
    setSelectedConversationId(conversationId);
    setInput("");
  }

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();

    const content = input.trim();
    if (!content || isGenerating) return;

    const now = new Date().toISOString();
    const userMessage: AIMessage = {
      id: makeId(),
      role: "user",
      content,
      createdAt: now,
    };

    let activeConversationId = selectedConversationId;

    if (!activeConversationId) {
      const nextConversation: AIConversation = {
        id: makeId(),
        title: content.slice(0, 40) || "New AI chat",
        messages: [userMessage],
        updatedAt: now,
      };

      setConversations((prev) => [nextConversation, ...prev]);
      setSelectedConversationId(nextConversation.id);
      activeConversationId = nextConversation.id;
    } else {
      setConversations((prev) =>
        prev
          .map((conversation) => {
            if (conversation.id !== activeConversationId) return conversation;
            return {
              ...conversation,
              messages: [...conversation.messages, userMessage],
              updatedAt: now,
            };
          })
          .sort(
            (a, b) =>
              new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
          ),
      );
    }

    setInput("");
    setIsGenerating(true);

    const currentMessages =
      conversations.find((c) => c.id === activeConversationId)?.messages ?? [];
    const payloadMessages = [...currentMessages, userMessage].map(
      (message) => ({
        role: message.role,
        content: message.content,
      }),
    );

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messages: payloadMessages }),
      });

      const data = await response.json();

      if (!response.ok || typeof data?.text !== "string") {
        throw new Error(data?.error || "Failed to generate response");
      }

      const assistantMessage: AIMessage = {
        id: makeId(),
        role: "assistant",
        content: data.text.trim(),
        createdAt: new Date().toISOString(),
      };

      setConversations((prev) =>
        prev
          .map((conversation) => {
            if (conversation.id !== activeConversationId) return conversation;
            return {
              ...conversation,
              messages: [...conversation.messages, assistantMessage],
              updatedAt: assistantMessage.createdAt,
            };
          })
          .sort(
            (a, b) =>
              new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
          ),
      );
    } catch {
      const fallbackMessage: AIMessage = {
        id: makeId(),
        role: "assistant",
        content: "I hit an issue generating a response. Please try again.",
        createdAt: new Date().toISOString(),
      };

      setConversations((prev) =>
        prev
          .map((conversation) => {
            if (conversation.id !== activeConversationId) return conversation;
            return {
              ...conversation,
              messages: [...conversation.messages, fallbackMessage],
              updatedAt: fallbackMessage.createdAt,
            };
          })
          .sort(
            (a, b) =>
              new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
          ),
      );
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <>
      <section className="w-[360px] bg-white rounded-2xl p-6 flex flex-col border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-bold text-gray-900 text-xl">AI History</h2>
          <button
            type="button"
            onClick={startNewChat}
            aria-label="Start new chat"
            className="w-10 h-10 rounded-lg bg-[#1E9A80] text-white hover:bg-[#17826b] transition-colors flex items-center justify-center"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center h-10 rounded-lg bg-gray-50 border border-gray-100 px-3 mb-4">
          <Search className="w-4 h-4 text-gray-400 mr-2" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search history"
            className="flex-1 bg-transparent outline-none text-gray-700 placeholder-gray-400 text-sm"
          />
        </div>

        <div className="flex-1 overflow-y-auto flex flex-col gap-2">
          {filteredConversations.length === 0 ? (
            <div className="h-full flex items-center justify-center text-sm text-gray-400 px-6 text-center">
              Start a conversation to see AI chat history.
            </div>
          ) : (
            filteredConversations.map((conversation) => {
              const latestMessage =
                conversation.messages[conversation.messages.length - 1]
                  ?.content || "No messages yet";

              return (
                <AIHistoryItem
                  key={conversation.id}
                  title={conversation.title}
                  preview={latestMessage}
                  updatedAt={conversation.updatedAt}
                  isActive={selectedConversationId === conversation.id}
                  onClick={() => setSelectedConversationId(conversation.id)}
                />
              );
            })
          )}
        </div>
      </section>

      <section className="flex-1 bg-white rounded-2xl flex flex-col overflow-hidden border border-gray-100">
        {selectedConversation ? (
          <>
            <div className="px-6 py-6 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#1E9A80]/10 flex items-center justify-center text-[#1E9A80]">
                  <Bot className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="font-bold text-gray-900 text-lg">Wing AI</h2>
                  <p className="text-xs text-gray-400">
                    {selectedConversation.title}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <IconButton icon={Search} />
                <IconButton icon={MoreHorizontal} />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto mx-4 p-4 flex flex-col gap-6 bg-[#F3F3EE] rounded-2xl">
              {selectedConversation.messages.map((message) => {
                const time = new Date(message.createdAt).toLocaleTimeString(
                  [],
                  {
                    hour: "2-digit",
                    minute: "2-digit",
                  },
                );

                return message.role === "user" ? (
                  <UserMessage
                    key={message.id}
                    text={message.content}
                    time={time}
                  />
                ) : (
                  <AssistantMessage
                    key={message.id}
                    text={message.content}
                    time={time}
                  />
                );
              })}

              {isGenerating && (
                <AssistantMessage
                  text={`Thinking${typingDots}`}
                  time={new Date().toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                />
              )}

              <div ref={messagesEndRef} />
            </div>

            <form
              onSubmit={sendMessage}
              className="mx-4 mt-2 mb-4 p-2 border-2 border-[#F3F3EE] rounded-full shrink-0 flex items-center gap-3"
            >
              <input
                type="text"
                placeholder="Ask Wing AI..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isGenerating}
                className="flex-1 bg-transparent outline-none text-gray-700 placeholder-gray-400 px-2 disabled:opacity-60"
              />
              <button type="button" className="text-gray p-2" disabled>
                <Mic className="w-5 h-5" />
              </button>
              <button type="button" className="text-gray p-2" disabled>
                <Smile className="w-5 h-5" />
              </button>
              <button type="button" className="text-gray p-2" disabled>
                <Paperclip className="w-5 h-5" />
              </button>
              <button
                type="submit"
                disabled={!input.trim() || isGenerating}
                className="w-10 h-10 rounded-full bg-[#1E9A80] flex items-center justify-center text-white hover:bg-[#17826b] transition-colors disabled:opacity-60 disabled:hover:bg-[#1E9A80]"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            Start a new AI conversation from the input below.
          </div>
        )}
      </section>
    </>
  );
}
