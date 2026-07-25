export interface FileMeta {
  name: string;
  size: number;
  mime_type: string;
  chunks: number;
}

// 与服务器协议保持一致
export interface ChatMessage {
  id: string;
  type: string; // "text" | "file" | "system"
  from: string;
  to: string;
  content: string;
  timestamp: number;
  status: string; // "sending" | "sent" | "delivered" | "read" | "failed"
  file_meta?: FileMeta;
}

export interface Contact {
  id: string;
  name: string;
  avatar?: string;
  online: boolean;
  lastMessage?: string;
  lastMessageTime?: number;
  unreadCount: number;
}

export interface ConnectionState {
  status: "disconnected" | "connecting" | "connected" | "error";
  url: string;
  error?: string;
}
