"use client";

import { useEffect, useRef, useState } from "react";
import {
  ChevronRight,
  CircleUser,
  Edit,
  Filter,
  MessageCircle,
  Search,
  Trash2,
  Upload,
  Volume2,
  X,
  Archive,
} from "lucide-react";
import type { ConversationPreview, User } from "./chat-types";

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

function MessageListItem({
  user,
  lastMessage,
  lastMessageTime,
  isActive = false,
  onClick,
  onContextMenu,
}: {
  user: User;
  lastMessage?: string | null;
  lastMessageTime?: string | null;
  isActive?: boolean;
  onClick?: () => void;
  onContextMenu?: (e: React.MouseEvent) => void;
}) {
  return (
    <div
      onClick={onClick}
      onContextMenu={onContextMenu}
      className={`flex items-center p-3 rounded-2xl cursor-pointer transition-colors ${
        isActive ? "bg-[#F3F3EE]" : "hover:bg-gray-50"
      }`}
    >
      <UserAvatar user={user} />
      <div className="flex-1 min-w-0 ml-3">
        <div className="flex justify-between items-center mb-1">
          <h3 className="font-semibold text-gray-900 truncate">{user.name}</h3>
          {lastMessageTime && (
            <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
              {formatRelativeTime(lastMessageTime)}
            </span>
          )}
        </div>
        {lastMessage && (
          <p className="text-sm text-gray-500 truncate">{lastMessage}</p>
        )}
      </div>
    </div>
  );
}

function NewMessagePopover({
  users,
  onClose,
  onSelectUser,
}: {
  users: User[];
  onClose: () => void;
  onSelectUser: (user: User) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onClose]);

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      (u.email && u.email.toLowerCase().includes(q))
    );
  });

  return (
    <div
      ref={ref}
      className="absolute top-16 left-8 right-6 z-50 bg-white rounded-2xl shadow-md border border-gray-200 pt-4 pb-2 mt-2"
    >
      <h3 className="font-semibold text-gray-900 text-lg px-5 mb-6">
        New Message
      </h3>
      <div className="px-5 mb-3">
        <div className="flex items-center h-10 rounded-lg bg-gray-50 border border-gray-100 px-3">
          <Search className="w-4 h-4 text-gray-400 mr-2" />
          <input
            type="text"
            placeholder="Search name or email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent outline-none text-gray-700 placeholder-gray-400 text-sm"
          />
        </div>
      </div>
      <div className="flex flex-col">
        {filtered.map((user) => (
          <button
            key={user.id}
            onClick={() => {
              onSelectUser(user);
              onClose();
            }}
            className="flex items-center gap-3 mx-2 px-3 py-2.5 rounded-lg text-gray-700 hover:bg-[#F3F3EE] transition-colors cursor-pointer"
          >
            <UserAvatar user={user} size="sm" />
            <span className="text-sm font-medium text-gray-800">
              {user.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function ConversationContextMenu({
  x,
  y,
  onClose,
  onDelete,
}: {
  x: number;
  y: number;
  onClose: () => void;
  onDelete: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    }
    function handleContextMenu(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("contextmenu", handleContextMenu);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("contextmenu", handleContextMenu);
    };
  }, [onClose]);

  const items = [
    { icon: MessageCircle, label: "Mark as unread" },
    { icon: Archive, label: "Archive" },
    { icon: Volume2, label: "Mute", hasSubmenu: true },
    { icon: CircleUser, label: "Contact info" },
    { icon: Upload, label: "Export chat" },
    { icon: X, label: "Clear chat" },
    { icon: Trash2, label: "Delete chat", danger: true, action: onDelete },
  ];

  return (
    <div
      ref={ref}
      className="fixed z-[100] bg-white rounded-2xl shadow-lg border border-gray-100 p-2 w-56 animate-in fade-in zoom-in-95 duration-100"
      style={{ top: y, left: x }}
    >
      {items.map((item) => (
        <button
          key={item.label}
          onClick={() => {
            item.action?.();
            onClose();
          }}
          className={`flex items-center gap-3 w-full px-3 py-2.5 text-sm transition-colors rounded-lg ${
            item.danger
              ? "text-red-500 hover:bg-red-50"
              : "text-gray-700 hover:bg-[#F3F3EE]"
          }`}
        >
          <item.icon className="w-4 h-4" />
          <span className="flex-1 text-left">{item.label}</span>
          {item.hasSubmenu && (
            <ChevronRight className="w-4 h-4 text-gray-400" />
          )}
        </button>
      ))}
    </div>
  );
}

export function MessageListPanel({
  users,
  conversations,
  selectedUser,
  onSelectUser,
  onDeleteConversation,
}: {
  users: User[];
  conversations: ConversationPreview[];
  selectedUser: User | null;
  onSelectUser: (user: User) => void;
  onDeleteConversation: (conversationId: string) => void;
}) {
  const [showNewMessage, setShowNewMessage] = useState(false);
  const [conversationSearch, setConversationSearch] = useState("");
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    conversationId: string;
  } | null>(null);

  function handleConversationContextMenu(
    e: React.MouseEvent,
    conversationId: string,
  ) {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, conversationId });
  }

  const filteredConversations = conversationSearch
    ? conversations.filter((c) => {
        const q = conversationSearch.toLowerCase();
        return (
          c.user.name.toLowerCase().includes(q) ||
          (c.user.email && c.user.email.toLowerCase().includes(q))
        );
      })
    : conversations;

  return (
    <>
      <section className="w-[420px] bg-white rounded-2xl flex flex-col overflow-hidden border border-gray-100">
        <div className="p-6 pb-4 relative">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800">All Message</h2>
            <button
              onClick={() => setShowNewMessage((v) => !v)}
              className="bg-[#1E9A80] text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium hover:bg-[#17826b] transition-colors"
            >
              <Edit className="w-4 h-4" />
              New Message
            </button>
          </div>
          {showNewMessage && (
            <NewMessagePopover
              users={users}
              onClose={() => setShowNewMessage(false)}
              onSelectUser={onSelectUser}
            />
          )}
          <div className="flex gap-2">
            <div className="relative flex-1 flex items-center h-10 rounded-lg bg-gray-50 border border-gray-100 px-3">
              <Search className="w-4 h-4 text-gray-400 mr-2" />
              <input
                type="text"
                placeholder="Search in message"
                value={conversationSearch}
                onChange={(e) => setConversationSearch(e.target.value)}
                className="flex-1 bg-transparent outline-none text-gray-700 placeholder-gray-400 text-sm"
              />
            </div>
            <IconButton icon={Filter} />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-4 flex flex-col gap-1">
          {filteredConversations.map((conv) => (
            <MessageListItem
              key={conv.id}
              user={conv.user}
              lastMessage={conv.lastMessage}
              lastMessageTime={conv.lastMessageTime}
              isActive={selectedUser?.id === conv.user.id}
              onClick={() => onSelectUser(conv.user)}
              onContextMenu={(e) => handleConversationContextMenu(e, conv.id)}
            />
          ))}
        </div>
      </section>

      {contextMenu && (
        <ConversationContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
          onDelete={() => onDeleteConversation(contextMenu.conversationId)}
        />
      )}
    </>
  );
}
