"use client";

import { useEffect, useRef } from "react";
import {
  CheckCheck,
  Mic,
  MoreHorizontal,
  Paperclip,
  Phone,
  Search,
  Send,
  Smile,
  Video,
} from "lucide-react";
import type { Message, User } from "./chat-types";

function UserAvatar({
  user,
  size = "md",
}: {
  user: { name: string; image?: string | null };
  size?: "sm" | "md";
}) {
  const sizeClass = size === "sm" ? "w-10 h-10 text-sm" : "w-12 h-12 text-lg";
  if (user.image) {
    return (
      <img
        src={user.image}
        alt={user.name}
        className={`${sizeClass} rounded-full object-cover shrink-0`}
      />
    );
  }
  return (
    <div
      className={`${sizeClass} rounded-full bg-[#1E9A80]/10 flex items-center justify-center text-[#1E9A80] font-semibold shrink-0`}
    >
      {user.name.charAt(0).toUpperCase()}
    </div>
  );
}

function IconButton({
  icon: Icon,
  onClick,
  className = "",
}: {
  icon: React.ElementType;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-10 h-10 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 ${className}`}
    >
      <Icon className="w-5 h-5" />
    </button>
  );
}

function ReceivedMessage({ text, time }: { text: string; time: string }) {
  return (
    <div className="flex flex-col gap-2 max-w-md">
      <div className="bg-white p-4 rounded-xl text-gray-800 w-fit">{text}</div>
      <span className="text-xs text-gray-400 ml-1">{time}</span>
    </div>
  );
}

function SentMessage({ text, time }: { text: string; time: string }) {
  return (
    <div className="flex flex-col gap-2 max-w-md self-end items-end">
      <div className="bg-[#F0FDF4] p-4 rounded-xl text-gray-800 w-fit">
        {text}
      </div>
      <div className="flex items-center gap-1 mr-1">
        <CheckCheck className="w-4 h-4 text-[#1E9A80]" />
        <span className="text-xs text-gray-400">{time}</span>
      </div>
    </div>
  );
}

export function ChatAreaPanel({
  currentUser,
  selectedUser,
  messages,
  input,
  onInputChange,
  onSendMessage,
}: {
  currentUser: User;
  selectedUser: User | null;
  messages: Message[];
  input: string;
  onInputChange: (value: string) => void;
  onSendMessage: (e: React.FormEvent) => void;
}) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <section className="flex-1 bg-white rounded-2xl flex flex-col overflow-hidden border border-gray-100">
      {selectedUser ? (
        <>
          <div className="px-6 py-6 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-4">
              <UserAvatar user={selectedUser} />
              <div>
                <h2 className="font-bold text-gray-900 text-lg">
                  {selectedUser.name}
                </h2>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <IconButton icon={Search} />
              <IconButton icon={Phone} />
              <IconButton icon={Video} />
              <IconButton icon={MoreHorizontal} />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto mx-4 p-4 flex flex-col gap-6 bg-[#F3F3EE] rounded-2xl">
            {messages.map((msg) =>
              msg.senderId === currentUser.id ? (
                <SentMessage
                  key={msg.id}
                  text={msg.content}
                  time={new Date(msg.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                />
              ) : (
                <ReceivedMessage
                  key={msg.id}
                  text={msg.content}
                  time={new Date(msg.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                />
              ),
            )}
            <div ref={messagesEndRef} />
          </div>

          <form
            onSubmit={onSendMessage}
            className="mx-4 mt-2 mb-4 p-2 border-2 border-[#F3F3EE] rounded-full shrink-0 flex items-center gap-3"
          >
            <input
              type="text"
              placeholder="Type any message..."
              value={input}
              onChange={(e) => onInputChange(e.target.value)}
              className="flex-1 bg-transparent outline-none text-gray-700 placeholder-gray-400 px-2"
            />
            <button type="button" className="text-gray p-2">
              <Mic className="w-5 h-5" />
            </button>
            <button type="button" className="text-gray p-2">
              <Smile className="w-5 h-5" />
            </button>
            <button type="button" className="text-gray p-2">
              <Paperclip className="w-5 h-5" />
            </button>
            <button
              type="submit"
              className="w-10 h-10 rounded-full bg-[#1E9A80] flex items-center justify-center text-white hover:bg-[#17826b] transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </>
      ) : (
        <div className="flex-1 flex items-center justify-center text-gray-400">
          Select a user to start chatting
        </div>
      )}
    </section>
  );
}
