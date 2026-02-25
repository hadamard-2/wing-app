"use client";

import { ChatAreaPanel } from "./chat-area-panel";
import { MessageListPanel } from "./message-list-panel";
import type { ConversationPreview, Message, User } from "./chat-types";

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
  return (
    <>
      <MessageListPanel
        users={users}
        conversations={conversations}
        selectedUser={selectedUser}
        onSelectUser={onSelectUser}
        onDeleteConversation={onDeleteConversation}
      />
      <ChatAreaPanel
        currentUser={currentUser}
        selectedUser={selectedUser}
        messages={messages}
        input={input}
        onInputChange={onInputChange}
        onSendMessage={onSendMessage}
      />
    </>
  );
}
