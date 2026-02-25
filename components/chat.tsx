/* eslint-disable */
"use client";

import { useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { ChatUI } from "./chat-ui";

interface User {
  id: string;
  name: string;
  email?: string;
  image?: string | null;
}

interface Message {
  id: string;
  content: string;
  senderId: string;
  conversationId: string;
  createdAt: string;
}

interface ConversationPreview {
  id: string;
  user: User;
  lastMessage: string | null;
  lastMessageTime: string | null;
  lastMessageSenderId: string | null;
}

interface ChatProps {
  currentUser: User;
}

export function Chat({ currentUser }: ChatProps) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [conversations, setConversations] = useState<ConversationPreview[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
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
      setConversations((prev) => {
        const idx = prev.findIndex((c) => c.id === msg.conversationId);
        if (idx === -1) {
          fetch("/api/conversations")
            .then((r) => r.json())
            .then(setConversations);
          return prev;
        }
        const updated = [...prev];
        const conv = {
          ...updated[idx],
          lastMessage: msg.content,
          lastMessageTime: msg.createdAt,
          lastMessageSenderId: msg.senderId,
        };
        updated.splice(idx, 1);
        return [conv, ...updated];
      });
    };

    socket.on("private_message", handler);
    return () => {
      socket.off("private_message", handler);
    };
  }, [socket]);

  useEffect(() => {
    if (!socket) return;

    const handler = ({ conversationId }: { conversationId: string }) => {
      setConversations((prev) => prev.filter((c) => c.id !== conversationId));
      if (conversationIdRef.current === conversationId) {
        setConversationId(null);
        setSelectedUser(null);
        setMessages([]);
      }
    };

    socket.on("conversation_deleted", handler);
    return () => {
      socket.off("conversation_deleted", handler);
    };
  }, [socket]);

  useEffect(() => {
    fetch("/api/users")
      .then((r) => r.json())
      .then(setUsers);
    fetch("/api/conversations")
      .then((r) => r.json())
      .then(setConversations);
  }, []);

  async function selectUser(user: User) {
    setSelectedUser(user);
    const existing = conversations.find((c) => c.user.id === user.id);
    if (existing) {
      const res = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      });
      const data = await res.json();
      setConversationId(data.id);
      setMessages(data.messages);
    } else {
      setConversationId(null);
      setMessages([]);
    }
  }

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || !socket || !selectedUser) return;

    let convId = conversationId;
    if (!convId) {
      const res = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: selectedUser.id }),
      });
      const data = await res.json();
      convId = data.id;
      setConversationId(convId);
      conversationIdRef.current = convId;
      setConversations((prev) => {
        if (prev.some((c) => c.id === data.id)) return prev;
        return [
          {
            id: data.id,
            user: selectedUser,
            lastMessage: null,
            lastMessageTime: null,
            lastMessageSenderId: null,
          },
          ...prev,
        ];
      });
    }

    socket.emit("private_message", {
      conversationId: convId,
      content: input.trim(),
    });
    setInput("");
  }

  async function deleteConversation(id: string) {
    const previousConversations = conversations;
    const previousConversationId = conversationIdRef.current;
    const previousSelectedUser = selectedUser;
    const previousMessages = messages;

    setConversations((prev) => prev.filter((c) => c.id !== id));
    if (previousConversationId === id) {
      setConversationId(null);
      conversationIdRef.current = null;
      setSelectedUser(null);
      setMessages([]);
    }

    try {
      const res = await fetch(`/api/conversations/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const payload = await res
          .json()
          .catch(() => ({ error: "Failed to delete conversation" }));
        throw new Error(payload.error || "Failed to delete conversation");
      }
    } catch (error) {
      console.error("Delete conversation failed:", error);
      setConversations(previousConversations);
      if (previousConversationId === id) {
        setConversationId(previousConversationId);
        conversationIdRef.current = previousConversationId;
        setSelectedUser(previousSelectedUser);
        setMessages(previousMessages);
      }
    }
  }

  return (
    <ChatUI
      currentUser={currentUser}
      users={users}
      conversations={conversations}
      selectedUser={selectedUser}
      messages={messages}
      input={input}
      onInputChange={setInput}
      onSendMessage={sendMessage}
      onSelectUser={selectUser}
      onDeleteConversation={deleteConversation}
    />
  );
}
