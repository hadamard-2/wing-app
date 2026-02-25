"use client";

import { useState } from "react";
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
} from "lucide-react";

const MAIN_NAV_ITEMS = [
  { id: "home", icon: Home },
  { id: "message", icon: MessageSquare },
  { id: "compass", icon: Compass },
  { id: "folder", icon: Folder },
  { id: "image", icon: ImageIcon },
];

const CHAT_MESSAGES = [
  {
    id: "1",
    name: "Adrian Kurt",
    time: "3 mins ago",
    msg: "Thanks for the explanation!",
    img: "12",
    isRead: true,
  },
  {
    id: "2",
    name: "Yomi Immanuel",
    time: "12 mins ago",
    msg: "Let's do a quick call after lunch, I'll explai...",
    img: "13",
  },
  {
    id: "3",
    name: "Bianca Nubia",
    time: "32 mins ago",
    msg: "anytime! my pleasure~",
    img: "14",
  },
  {
    id: "4",
    name: "Zender Lowre",
    time: "1 hour ago",
    msg: "Okay cool, that make sense 👍",
    img: "15",
  },
  {
    id: "5",
    name: "Palmer Dian",
    time: "5 hour ago",
    msg: "Thanks, Jonas! That helps 😅",
    img: "16",
  },
  {
    id: "6",
    name: "Yuki Tanaka",
    time: "12 hour ago",
    msg: "Have you watch the new season of Danm...",
    img: "17",
  },
];

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

type ConversationMessage = {
  id: string;
  type: "received" | "sent";
  texts: string[];
  time: string;
  isRead?: boolean;
};

const CONVERSATION_MESSAGES: ConversationMessage[] = [
  {
    id: "m1",
    type: "received",
    texts: [
      "Hey, Dan",
      "Can you help with with the last task on basecamp, please?",
      "I'm little bit confused with the task.. 😅",
    ],
    time: "10:17 AM",
  },
  {
    id: "m2",
    type: "sent",
    texts: ["it's done already, no worries!"],
    time: "10:22 AM",
    isRead: true,
  },
  {
    id: "m3",
    type: "received",
    texts: ["what...", "Really?! Thank you so much! 😍"],
    time: "10:32 AM",
  },
  {
    id: "m4",
    type: "sent",
    texts: ["anytime! my pleasure~"],
    time: "11:01 AM",
    isRead: true,
  },
];

function ReceivedMessage({ texts, time }: { texts: string[]; time: string }) {
  return (
    <div className="flex flex-col gap-2 max-w-md">
      {texts.map((text, i) => (
        <div key={i} className="bg-white p-4 rounded-xl text-gray-800 w-fit">
          {text}
        </div>
      ))}
      <span className="text-xs text-gray-400 ml-1">{time}</span>
    </div>
  );
}

function SentMessage({
  texts,
  time,
  isRead = false,
}: {
  texts: string[];
  time: string;
  isRead?: boolean;
}) {
  return (
    <div className="flex flex-col gap-2 max-w-md self-end items-end">
      {texts.map((text, i) => (
        <div
          key={i}
          className="bg-[#F0FDF4] p-4 rounded-xl text-gray-800 w-fit"
        >
          {text}
        </div>
      ))}
      <div className="flex items-center gap-1 mr-1">
        <CheckCheck
          className={`w-4 h-4 ${isRead ? "text-[#1E9A80]" : "text-gray-300"}`}
        />
        <span className="text-xs text-gray-400">{time}</span>
      </div>
    </div>
  );
}

function MessageListItem({
  name,
  time,
  msg,
  img,
  isActive = false,
  isRead = false,
  onClick,
}: {
  name: string;
  time: string;
  msg: string;
  img: string;
  isActive?: boolean;
  isRead?: boolean;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`flex items-center p-3 rounded-2xl cursor-pointer transition-colors ${
        isActive ? "bg-[#F3F3EE]" : "hover:bg-gray-50"
      }`}
    >
      <Avatar src={`https://i.pravatar.cc/150?img=${img}`} alt={name} />
      <div className="flex-1 min-w-0 ml-3">
        <div className="flex justify-between items-center mb-1">
          <h3 className="font-semibold text-gray-900 truncate">{name}</h3>
          <span className="text-xs text-gray-400 whitespace-nowrap">
            {time}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-500 truncate">{msg}</p>
          <CheckCheck
            className={`w-4 h-4 flex-shrink-0 ml-2 ${
              isRead ? "text-[#1E9A80]" : "text-gray-300"
            }`}
          />
        </div>
      </div>
    </div>
  );
}

export function ChatUI() {
  const [activeTab, setActiveTab] = useState("message");
  const [activeMessageId, setActiveMessageId] = useState(CHAT_MESSAGES[0].id);

  return (
    <div className="h-screen w-full bg-[#F3F3EE] flex p-4 font-sans text-sm gap-4">
      {/* Left Sidebar (Full Height) */}
      <aside className="w-16 flex flex-col items-center h-full">
        <div className="w-12 h-12 flex items-center justify-center mt-3 mb-10">
          <img src="/wing-logo.svg" alt="Wing Logo" className="w-12 h-12" />
        </div>
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
            <div className="p-6 pb-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800">All Message</h2>
                <button className="bg-[#1E9A80] text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium hover:bg-[#17826b] transition-colors">
                  <Edit className="w-4 h-4" />
                  New Message
                </button>
              </div>
              <div className="flex gap-2">
                <div className="relative flex-1 flex items-center h-10 rounded-lg bg-gray-50 border border-gray-100 px-3">
                  <Search className="w-4 h-4 text-gray-400 mr-2" />
                  <input
                    type="text"
                    placeholder="Search in message"
                    className="flex-1 bg-transparent outline-none text-gray-700 placeholder-gray-400 text-sm"
                  />
                </div>
                <IconButton icon={Filter} className="text-gray-500" />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 pb-4 flex flex-col gap-1">
              {CHAT_MESSAGES.map((chat) => (
                <MessageListItem
                  key={chat.id}
                  {...chat}
                  isActive={activeMessageId === chat.id}
                  onClick={() => setActiveMessageId(chat.id)}
                />
              ))}
            </div>
          </section>

          {/* Chat Area Island */}
          <section className="flex-1 bg-white rounded-2xl flex flex-col overflow-hidden border border-gray-100">
            {/* Chat Header */}
            <div className="px-6 py-6 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-4">
                <Avatar
                  src="https://i.pravatar.cc/150?img=11"
                  alt="Daniel CH"
                />
                <div>
                  <h2 className="font-bold text-gray-900 text-lg">Daniel CH</h2>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-[#1E9A80]"></div>
                    <span className="text-xs text-[#1E9A80] font-medium">
                      Online
                    </span>
                  </div>
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
              <div className="flex justify-center my-4">
                <span className="bg-white px-4 py-1.5 rounded-full text-xs font-medium text-gray-500 border border-gray-100">
                  Today
                </span>
              </div>

              {CONVERSATION_MESSAGES.map((msg) =>
                msg.type === "received" ? (
                  <ReceivedMessage
                    key={msg.id}
                    texts={msg.texts}
                    time={msg.time}
                  />
                ) : (
                  <SentMessage
                    key={msg.id}
                    texts={msg.texts}
                    time={msg.time}
                    isRead={msg.isRead}
                  />
                )
              )}
            </div>

            {/* Input Sub-Island */}
            <div className="mx-4 mt-2 mb-4 p-2 border-2 border-[#F3F3EE] rounded-full shrink-0 flex items-center gap-3">
              <input
                type="text"
                placeholder="Type any message..."
                className="flex-1 bg-transparent outline-none text-gray-700 placeholder-gray-400 px-2"
              />
              <button className="text-gray p-2">
                <Mic className="w-5 h-5" />
              </button>
              <button className="text-gray p-2">
                <Smile className="w-5 h-5" />
              </button>
              <button className="text-gray p-2">
                <Paperclip className="w-5 h-5" />
              </button>
              <button className="w-10 h-10 rounded-full bg-[#1E9A80] flex items-center justify-center text-white hover:bg-[#17826b] transition-colors">
                <Send className="w-4 h-4" />
              </button>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
