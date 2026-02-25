"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  Bell,
  ChevronDown,
  Compass,
  Folder,
  Gift,
  Home,
  Image as ImageIcon,
  LogOut,
  MessageSquare,
  Search,
  Pencil,
  Settings,
  Sparkle,
} from "lucide-react";
import type { User } from "./chat-types";

const MAIN_NAV_ITEMS = [
  { id: "home", label: "Home", icon: Home },
  { id: "message", label: "Message", icon: MessageSquare },
  { id: "compass", label: "Explore", icon: Compass },
  { id: "folder", label: "Folder", icon: Folder },
  { id: "image", label: "Image", icon: ImageIcon },
];

const STAR_NAV_ITEM = { id: "star", label: "AI", icon: Sparkle };

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
  fallbackText,
  size = "md",
  className = "",
}: {
  src?: string | null;
  alt: string;
  fallbackText?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const sizeClass = {
    sm: "w-10 h-10",
    md: "w-12 h-12",
    lg: "w-14 h-14",
  }[size];

  if (!src) {
    const initial = (fallbackText || alt || "?").charAt(0).toUpperCase();
    return (
      <div
        className={`${sizeClass} rounded-full bg-[#1E9A80]/10 flex items-center justify-center text-[#1E9A80] font-semibold shrink-0 ${className}`}
      >
        {initial}
      </div>
    );
  }

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

export function ChatLayoutShell({
  currentUser,
  children,
}: {
  currentUser: User;
  children: React.ReactNode;
}) {
  const [activeTab, setActiveTab] = useState("message");
  const [showLogoMenu, setShowLogoMenu] = useState(false);
  const activeNavItem =
    [...MAIN_NAV_ITEMS, STAR_NAV_ITEM].find((item) => item.id === activeTab) ||
    MAIN_NAV_ITEMS[1];
  const ActiveNavIcon = activeNavItem.icon;

  return (
    <div className="h-screen w-full bg-[#F3F3EE] flex p-4 font-sans text-sm gap-4">
      <aside className="w-16 flex flex-col items-center h-full relative">
        <button
          onClick={() => setShowLogoMenu((v) => !v)}
          className="w-12 h-12 flex items-center justify-center mt-3 mb-10 cursor-pointer"
        >
          <img src="/wing-logo.svg" alt="Wing Logo" className="w-12 h-12" />
        </button>
        {showLogoMenu && <LogoPopover onClose={() => setShowLogoMenu(false)} />}
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
            id={STAR_NAV_ITEM.id}
            icon={STAR_NAV_ITEM.icon}
            activeTab={activeTab}
            onClick={setActiveTab}
          />
          <div className="w-12 h-12 flex items-center justify-center">
            <Avatar
              src={currentUser.image}
              alt={currentUser.name}
              fallbackText={currentUser.name}
              size="sm"
              className="border-2 border-white shadow-sm"
            />
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center justify-between mb-4 px-6 py-3 bg-white rounded-2xl border border-gray-100">
          <div className="flex items-center gap-4">
            <ActiveNavIcon className="w-5 h-5 text-[#1E9A80]" />
            <span className="font-semibold text-lg text-gray-800">
              {activeNavItem.label}
            </span>
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
                src={currentUser.image}
                alt={currentUser.name}
                fallbackText={currentUser.name}
                size="sm"
                className="border border-gray-200"
              />
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </div>
          </div>
        </header>

        <main className="flex-1 flex gap-4 overflow-hidden">{children}</main>
      </div>
    </div>
  );
}
