"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Bot,
  Mic,
  MoreHorizontal,
  MoreVertical,
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
  lastMessage: string | null;
  updatedAt: string;
};

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
  isActive,
  onClick,
  onRename,
  onDelete,
}: {
  title: string;
  isActive: boolean;
  onClick: () => void;
  onRename: () => void;
  onDelete: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }

    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpen]);

  return (
    <div
      onClick={onClick}
      className={`w-full text-left py-3 pr-3 pl-5 rounded-2xl transition-colors cursor-pointer flex items-center justify-between gap-2 ${
        isActive ? "bg-[#F3F3EE]" : "hover:bg-gray-50"
      }`}
    >
      <div className="min-w-0 flex-1">
        <h3 className="font-semibold text-gray-900 truncate pr-2">{title}</h3>
      </div>

      <div className="relative shrink-0" ref={menuRef}>
        <button
          type="button"
          aria-label="Conversation menu"
          onClick={(event) => {
            event.stopPropagation();
            setMenuOpen((open) => !open);
          }}
          className="w-7 h-7 rounded-md flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100"
        >
          <MoreVertical className="w-5 h-5" />
        </button>

        {menuOpen && (
          <div
            className="absolute right-0 top-8 z-20 min-w-[140px] rounded-lg border border-gray-200 bg-white shadow-md p-1"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                onRename();
              }}
              className="w-full text-left px-3 py-2 text-sm text-gray-700 rounded-md hover:bg-gray-100"
            >
              Rename chat
            </button>
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                onDelete();
              }}
              className="w-full text-left px-3 py-2 text-sm text-red-600 rounded-md hover:bg-red-50"
            >
              Delete chat
            </button>
          </div>
        )}
      </div>
    </div>
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
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [input, setInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [typingDots, setTypingDots] = useState(".");
  const [search, setSearch] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const selectedConversation = conversations.find(
    (conversation) => conversation.id === selectedConversationId,
  );

  const filteredConversations = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return conversations;
    return conversations.filter((conversation) => {
      const latest = conversation.lastMessage || "";
      return (
        conversation.title.toLowerCase().includes(query) ||
        latest.toLowerCase().includes(query)
      );
    });
  }, [conversations, search]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isGenerating]);

  useEffect(() => {
    fetch("/api/ai/conversations")
      .then((response) => response.json())
      .then((data) => {
        if (!Array.isArray(data)) {
          setConversations([]);
          return;
        }
        setConversations(data);
      })
      .catch(() => {
        setConversations([]);
      });
  }, []);

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

  async function loadConversation(conversationId: string) {
    const response = await fetch(`/api/ai/conversations/${conversationId}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.error || "Failed to load conversation");
    }

    setSelectedConversationId(data.id);
    setMessages(data.messages ?? []);
  }

  async function startNewChat() {
    try {
      const response = await fetch("/api/ai/conversations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title: "New AI chat" }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Failed to create conversation");
      }

      setConversations((prev) => [
        {
          id: data.id,
          title: data.title,
          updatedAt: data.updatedAt,
          lastMessage: null,
        },
        ...prev,
      ]);
      setSelectedConversationId(data.id);
      setMessages([]);
      setInput("");
    } catch (error) {
      console.error("Failed to start new AI chat:", error);
    }
  }

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();

    const content = input.trim();
    if (!content || isGenerating) return;

    const optimisticMessageId = `temp-${Date.now()}`;
    const optimisticUserMessage: AIMessage = {
      id: optimisticMessageId,
      role: "user",
      content,
      createdAt: new Date().toISOString(),
    };

    setInput("");
    setIsGenerating(true);

    try {
      let activeConversationId = selectedConversationId;

      if (!activeConversationId) {
        const createResponse = await fetch("/api/ai/conversations", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: content.slice(0, 40) || "New AI chat",
          }),
        });
        const createData = await createResponse.json();

        if (!createResponse.ok) {
          throw new Error(createData?.error || "Failed to create conversation");
        }

        activeConversationId = createData.id;
        setSelectedConversationId(createData.id);
        setMessages([optimisticUserMessage]);
        setConversations((prev) => [
          {
            id: createData.id,
            title: createData.title,
            updatedAt: createData.updatedAt,
            lastMessage: null,
          },
          ...prev,
        ]);
      } else {
        setMessages((prev) => [...prev, optimisticUserMessage]);
      }

      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          conversationId: activeConversationId,
          content,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Failed to generate response");
      }

      const userMessage = data?.userMessage as AIMessage;
      const assistantMessage = data?.assistantMessage as AIMessage;

      if (!userMessage || !assistantMessage) {
        throw new Error("Invalid AI response payload");
      }

      setMessages((prev) => {
        const next = prev.map((message) =>
          message.id === optimisticMessageId ? userMessage : message,
        );

        const hasOptimistic = prev.some(
          (message) => message.id === optimisticMessageId,
        );

        if (!hasOptimistic) {
          next.push(userMessage);
        }

        next.push(assistantMessage);
        return next;
      });
      setConversations((prev) =>
        prev
          .map((conversation) => {
            if (conversation.id !== activeConversationId) return conversation;
            const fallbackTitle = content.slice(0, 40) || "New AI chat";
            return {
              ...conversation,
              title:
                conversation.lastMessage === null &&
                conversation.title === "New AI chat"
                  ? fallbackTitle
                  : conversation.title,
              lastMessage: assistantMessage.content,
              updatedAt: assistantMessage.createdAt,
            };
          })
          .sort(
            (a, b) =>
              new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
          ),
      );
    } catch (error) {
      console.error("Failed to send AI message:", error);
    } finally {
      setIsGenerating(false);
    }
  }

  async function selectConversation(conversationId: string) {
    try {
      await loadConversation(conversationId);
    } catch (error) {
      console.error("Failed to load AI conversation:", error);
    }
  }

  async function deleteConversation(conversationId: string) {
    const previousConversations = conversations;
    const previousSelectedId = selectedConversationId;
    const previousMessages = messages;

    setConversations((prev) =>
      prev.filter((item) => item.id !== conversationId),
    );
    if (selectedConversationId === conversationId) {
      setSelectedConversationId(null);
      setMessages([]);
    }

    try {
      const response = await fetch(`/api/ai/conversations/${conversationId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const data = await response
          .json()
          .catch(() => ({ error: "Failed to delete AI conversation" }));
        throw new Error(data.error || "Failed to delete AI conversation");
      }
    } catch (error) {
      console.error("Failed to delete AI conversation:", error);
      setConversations(previousConversations);
      if (previousSelectedId === conversationId) {
        setSelectedConversationId(previousSelectedId);
        setMessages(previousMessages);
      }
    }
  }

  async function renameConversation(conversationId: string) {
    const currentConversation = conversations.find(
      (conversation) => conversation.id === conversationId,
    );
    if (!currentConversation) return;

    const nextTitle = window
      .prompt("Rename AI conversation", currentConversation.title)
      ?.trim();

    if (!nextTitle || nextTitle === currentConversation.title) {
      return;
    }

    const previousConversations = conversations;
    setConversations((prev) =>
      prev.map((conversation) =>
        conversation.id === conversationId
          ? { ...conversation, title: nextTitle }
          : conversation,
      ),
    );

    try {
      const response = await fetch(`/api/ai/conversations/${conversationId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title: nextTitle }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data?.error || "Failed to rename AI conversation");
      }

      setConversations((prev) =>
        prev.map((conversation) =>
          conversation.id === conversationId
            ? {
                ...conversation,
                title: data?.title ?? nextTitle,
                updatedAt: data?.updatedAt ?? conversation.updatedAt,
              }
            : conversation,
        ),
      );
    } catch (error) {
      console.error("Failed to rename AI conversation:", error);
      setConversations(previousConversations);
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
              return (
                <AIHistoryItem
                  key={conversation.id}
                  title={conversation.title}
                  isActive={selectedConversationId === conversation.id}
                  onClick={() => selectConversation(conversation.id)}
                  onRename={() => renameConversation(conversation.id)}
                  onDelete={() => deleteConversation(conversation.id)}
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
              {messages.map((message) => {
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
