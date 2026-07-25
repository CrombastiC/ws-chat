import { useState, type KeyboardEvent } from "react";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useChatStore } from "@/stores/chatStore";

export default function MessageInput({ contactId }: { contactId: string }) {
  const [text, setText] = useState("");
  const { sendMessage } = useWebSocket();
  const connection = useChatStore((s) => s.connection);

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    sendMessage(contactId, trimmed, "text");
    setText("");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = async () => {
    const fileName = `file-${Date.now()}.txt`;
    sendMessage(contactId, fileName, "file");
  };

  const connected = connection.status === "connected";

  return (
    <div className="border-t border-neutral-700/50 p-4 bg-chat-bg">
      <div className="flex items-end gap-2">
        <button
          onClick={handleFileSelect}
          disabled={!connected}
          className="p-2 rounded-lg hover:bg-chat-hover transition-colors text-neutral-400 hover:text-neutral-200 disabled:opacity-40"
          title="Send file"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
          </svg>
        </button>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={connected ? "Type a message..." : "请先连接服务器..."}
          disabled={!connected}
          rows={1}
          className="flex-1 resize-none bg-chat-input rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-chat-accent max-h-32 disabled:opacity-50"
        />
        <button
          onClick={handleSend}
          disabled={!text.trim() || !connected}
          className="p-2.5 rounded-xl bg-chat-accent hover:bg-chat-accent/80 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </div>
    </div>
  );
}
