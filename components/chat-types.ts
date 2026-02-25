export interface User {
  id: string;
  name: string;
  email?: string;
  image?: string | null;
}

export interface Message {
  id: string;
  content: string;
  senderId: string;
  conversationId: string;
  createdAt: string;
}

export interface ConversationPreview {
  id: string;
  user: User;
  lastMessage: string | null;
  lastMessageTime: string | null;
  lastMessageSenderId: string | null;
}
