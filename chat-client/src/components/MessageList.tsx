import { useEffect, useRef } from "react";
import { useShallow } from "zustand/react/shallow";
import type { ChatMessage } from "@/types/message";
import { useChatStore } from "@/stores/chatStore";

function MessageBubble({ message, isSelf }: { message: ChatMessage; isSelf: boolean }) {
  return (
    <div className={`flex ${isSelf ? "justify-end" : "justify-start"} mb-2`}>
      <div
        className={`max-w-[70%] px-4 py-2 rounded-2xl ${
          isSelf
            ? "bg-chat-bubble-self rounded-br-md"
            : "bg-chat-bubble-other rounded-bl-md"
        }`}
      >
        {message.type === "file" ? (
          <div className="flex items-center gap-2">
            <span className="text-lg">📎</span>
            <div>
              <p className="text-sm font-medium">{message.content}</p>
              {message.file_meta && (
                <p className="text-xs text-neutral-400">
                  {(message.file_meta.size / 1024).toFixed(1)} KB
                </p>
              )}
            </div>
          </div>
        ) : (
          <p className="text-sm whitespace-pre-wrap break-words">
            {message.content}
          </p>
        )}
        <div className="flex items-center justify-end gap-1 mt-1">
          <span className="text-[10px] text-neutral-400">
            {new Date(message.timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
          {isSelf && (
            <span className="text-[10px] text-neutral-400">
              {message.status === "sending" && "⋯"}
              {message.status === "sent" && "✓"}
              {message.status === "delivered" && "✓✓"}
              {message.status === "read" && "✓✓"}
              {message.status === "failed" && "✗"}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function MessageList({ contactId }: { contactId: string }) {
  const messages = useChatStore(
    useShallow((s) => s.messages[contactId] ?? [])
  );
  const currentUserId = useChatStore((s) => s.currentUserId);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4">
      {messages.length === 0 && (
        <div className="flex items-center justify-center h-full text-neutral-500">
          <p>No messages yet. Say hello!</p>
        </div>
      )}
      {messages.map((msg) => (
        <MessageBubble
          key={msg.id}
          message={msg}
          isSelf={msg.from === currentUserId}
        />
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
