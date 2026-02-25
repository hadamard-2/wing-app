/* eslint-disable */
"use client";

import { useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SignOutButton } from "@/components/sign-out-button";
import { ChatUI } from "./chat-ui";

interface User {
  id: string;
  name: string;
}

interface Message {
  id: string;
  content: string;
  senderId: string;
  conversationId: string;
  createdAt: string;
}

interface ChatProps {
  currentUser: User;
}

export function Chat({ currentUser }: ChatProps) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const conversationIdRef = useRef<string | null>(null);

  useEffect(() => {
    conversationIdRef.current = conversationId;
  }, [conversationId]);

  useEffect(() => {
    const s = io();
    setSocket(s);
    return () => {
      s.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handler = (msg: Message) => {
      if (msg.conversationId === conversationIdRef.current) {
        setMessages((prev) => [...prev, msg]);
      }
    };

    socket.on("private_message", handler);
    return () => {
      socket.off("private_message", handler);
    };
  }, [socket]);

  useEffect(() => {
    fetch("/api/users")
      .then((r) => r.json())
      .then(setUsers);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function selectUser(user: User) {
    setSelectedUser(user);
    const res = await fetch("/api/conversations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id }),
    });
    const data = await res.json();
    setConversationId(data.id);
    setMessages(data.messages);
  }

  function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || !socket || !conversationId) return;

    socket.emit("private_message", {
      conversationId,
      content: input.trim(),
    });
    setInput("");
  }

  return <ChatUI />;
}
