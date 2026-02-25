"use client";

import { useState, useRef, useEffect } from "react";
import {
  Search,
  Bell,
  Settings,
  ChevronDown,
  Home,
  MessageSquare,
  Compass,
  Folder,
  Image as ImageIcon,
  Filter,
  CheckCheck,
  Phone,
  Video,
  MoreHorizontal,
  Mic,
  Smile,
  Paperclip,
  Send,
  Edit,
  Sparkle,
  ArrowLeft,
  Pencil,
  Gift,
  LogOut,
  MessageCircle,
  Archive,
  Volume2,
  CircleUser,
  Upload,
  X,
  Trash2,
  ChevronRight,
} from "lucide-react";

const MAIN_NAV_ITEMS = [
  { id: "home", icon: Home },
  { id: "message", icon: MessageSquare },
  { id: "compass", icon: Compass },
  { id: "folder", icon: Folder },
  { id: "image", icon: ImageIcon },
];

interface User {
  id: string;
  name: string;
  email?: string;
  image?: string | null;
}

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

interface ChatUIProps {
  currentUser: User;
  users: User[];
  conversations: ConversationPreview[];
  selectedUser: User | null;
  messages: Message[];
  input: string;
  onInputChange: (value: string) => void;
  onSendMessage: (e: React.FormEvent) => void;
  onSelectUser: (user: User) => void;
  onDeleteConversation: (conversationId: string) => void;
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

function Avatar({
  src,
  alt,
  size = "md",
  className = "",
}: {
  src: string;
  alt: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const sizeClass = {
    sm: "w-10 h-10",
    md: "w-12 h-12",
    lg: "w-14 h-14",
  }[size];

  return (
    <img
      src={src}
      alt={alt}
      className={`${sizeClass} rounded-full object-cover ${className}`}
    />
  );
}

function SidebarItem({
  id,
  icon: Icon,
  activeTab,
  onClick,
}: {
  id: string;
  icon: React.ElementType;
  activeTab: string;
  onClick: (id: string) => void;
  roundedClass?: string;
}) {
  const isActive = activeTab === id;
  return (
    <button
      onClick={() => onClick(id)}
      className={`w-12 h-12 rounded-lg flex items-center justify-center transition-colors ${
        isActive
          ? "bg-[#1E9A80]/10 border border-[#1E9A80]"
          : "border border-transparent"
      }`}
    >
      <Icon
        className={`w-5 h-5 ${isActive ? "text-[#1E9A80]" : "text-black"}`}
      />
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

function LogoPopover({ onClose }: { onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="absolute top-[72px] left-0 z-50 w-80 bg-white rounded-2xl shadow-lg border border-gray-100 py-3 animate-in fade-in slide-in-from-left-2 duration-150"
    >
      <button className="flex items-center gap-3 w-full px-5 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors text-sm">
        <ArrowLeft className="w-4 h-4" />
        Go back to dashboard
      </button>
      <button className="flex items-center gap-3 w-full px-5 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors text-sm">
        <Pencil className="w-4 h-4" />
        Rename file
      </button>

      <div className="border-t-2 border-gray-100 m-2" />

      <div className="px-5 py-2">
        <p className="font-semibold text-gray-900 text-sm">testing2</p>
        <p className="text-xs text-gray-400">testing2@gmail.com</p>
      </div>

      <div className="px-5 py-2">
        <div className="flex justify-between text-xs text-gray-500 my-4">
          <span>
            Credits <span className="font-semibold text-gray-800">20 left</span>
          </span>
          <span>
            Renews in{" "}
            <span className="font-semibold text-gray-800">6h 24m</span>
          </span>
        </div>
        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-[#1E9A80] rounded-full w-4/5" />
        </div>
        <div className="flex justify-between text-xs mt-1.5">
          <span className="text-gray-500">5 of 25 used today</span>
          <span className="text-[#1E9A80] font-medium">+25 tomorrow</span>
        </div>
      </div>

      <div className="border-t-2 border-gray-100 m-2" />

      <button className="flex items-center gap-3 w-full px-5 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors text-sm">
        <Gift className="w-4 h-4" />
        Win free credits
      </button>
      <button className="flex items-center gap-3 w-full px-5 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors text-sm">
        <Settings className="w-4 h-4" />
        Theme Style
      </button>

      <div className="border-t-2 border-gray-100 m-2" />

      <button className="flex items-center gap-3 w-full px-5 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors text-sm">
        <LogOut className="w-4 h-4" />
        Log out
      </button>
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
      className="absolute top-16 left-8 right-6 z-50 bg-white rounded-2xl shadow-md border border-gray-200 py-4 mt-2"
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
            className="flex items-center gap-3 px-5 py-2.5 hover:bg-gray-50 transition-colors cursor-pointer"
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

export function ChatUI({
  currentUser,
  users,
  conversations,
  selectedUser,
  messages,
  input,
  onInputChange,
  onSendMessage,
  onSelectUser,
  onDeleteConversation,
}: ChatUIProps) {
  const [activeTab, setActiveTab] = useState("message");
  const [showLogoMenu, setShowLogoMenu] = useState(false);
  const [showNewMessage, setShowNewMessage] = useState(false);
  const [conversationSearch, setConversationSearch] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    conversationId: string;
  } | null>(null);

  function handleConversationContextMenu(
    e: React.MouseEvent,
    conversationId: string
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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="h-screen w-full bg-[#F3F3EE] flex p-4 font-sans text-sm gap-4">
      {/* Left Sidebar (Full Height) */}
      <aside className="w-16 flex flex-col items-center h-full relative">
        <button
          onClick={() => setShowLogoMenu((v) => !v)}
          className="w-12 h-12 flex items-center justify-center mt-3 mb-10 cursor-pointer"
        >
          <img src="/wing-logo.svg" alt="Wing Logo" className="w-12 h-12" />
        </button>
        {showLogoMenu && (
          <LogoPopover onClose={() => setShowLogoMenu(false)} />
        )}
        <nav className="flex flex-col gap-2">
          {MAIN_NAV_ITEMS.map((item) => (
            <SidebarItem
              key={item.id}
              id={item.id}
              icon={item.icon}
              activeTab={activeTab}
              onClick={setActiveTab}
            />
          ))}
        </nav>
        <div className="mt-auto flex flex-col gap-4 items-center">
          <SidebarItem
            id="star"
            icon={Sparkle}
            activeTab={activeTab}
            onClick={setActiveTab}
          />
          <div className="w-12 h-12 flex items-center justify-center">
            <Avatar
              src="https://i.pravatar.cc/150?img=5"
              alt="Profile"
              size="sm"
              className="border-2 border-white shadow-sm"
            />
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation Island */}
        <header className="flex items-center justify-between mb-4 px-6 py-3 bg-white rounded-2xl border border-gray-100">
          <div className="flex items-center gap-4">
            <MessageSquare className="w-5 h-5 text-[#1E9A80]" />
            <span className="font-semibold text-lg text-gray-800">Message</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative flex items-center h-10 rounded-lg bg-gray-50 border border-gray-200 px-4">
              <Search className="w-4 h-4 text-gray-400 mr-2" />
              <input
                type="text"
                placeholder="Search"
                className="bg-transparent outline-none text-gray-700 placeholder-gray-400 w-48"
              />
              <div className="flex items-center gap-1 text-gray-400 text-xs border border-gray-200 rounded px-1.5 py-0.5">
                <span>⌘</span>
                <span>K</span>
              </div>
            </div>
            <IconButton icon={Bell} />
            <IconButton icon={Settings} />

            <div className="w-px h-6 bg-gray-200" />

            <div className="flex items-center gap-2 cursor-pointer">
              <Avatar
                src="https://i.pravatar.cc/150?img=11"
                alt="User"
                size="sm"
                className="border border-gray-200"
              />
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex gap-4 overflow-hidden">
          {/* Message List */}
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
                  onContextMenu={(e) =>
                    handleConversationContextMenu(e, conv.id)
                  }
                />
              ))}
            </div>
          </section>

          {/* Chat Area Island */}
          <section className="flex-1 bg-white rounded-2xl flex flex-col overflow-hidden border border-gray-100">
            {selectedUser ? (
              <>
                {/* Chat Header */}
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

                {/* Messages Sub-Island */}
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
                    )
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Sub-Island */}
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
        </main>
      </div>

      {contextMenu && (
        <ConversationContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
          onDelete={() => onDeleteConversation(contextMenu.conversationId)}
        />
      )}
    </div>
  );
}
