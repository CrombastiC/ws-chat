import { useChatStore } from "@/stores/chatStore";
import { useWebSocket } from "@/hooks/useWebSocket";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";

export default function ChatWindow() {
  const activeId = useChatStore((s) => s.activeContactId);
  const contacts = useChatStore((s) => s.contacts);
  const connection = useChatStore((s) => s.connection);
  const { disconnect } = useWebSocket();

  if (!activeId) {
    return (
      <div className="flex-1 flex items-center justify-center bg-chat-bg">
        <div className="text-center text-neutral-500">
          <p className="text-4xl mb-3">💬</p>
          <p className="text-lg">选择一个会话开始聊天</p>
          <p className="text-sm mt-1">对方发消息后会自动出现在这里</p>
        </div>
      </div>
    );
  }

  const contact = contacts.find((c) => c.id === activeId);
  if (!contact) return null;

  return (
    <div className="flex-1 flex flex-col bg-chat-bg min-w-0">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-700/50 bg-chat-bg">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-chat-accent flex items-center justify-center text-xs font-semibold">
            {contact.name.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <p className="font-medium text-sm">{contact.name}</p>
            <p className="text-xs text-neutral-400">
              {contact.online ? (
                <span className="text-green-400">在线</span>
              ) : (
                "离线"
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`w-2 h-2 rounded-full ${connection.status === "connected" ? "bg-green-400" : "bg-red-400"}`} />
          <span className="text-xs text-neutral-400">{connection.status === "connected" ? "已连接" : "未连接"}</span>
          <button
            onClick={disconnect}
            className="text-xs text-neutral-400 hover:text-red-400 transition-colors px-2 py-1 rounded hover:bg-chat-hover"
          >
            断开
          </button>
        </div>
      </div>

      {/* Messages */}
      <MessageList contactId={activeId} />

      {/* Input */}
      <MessageInput contactId={activeId} />
    </div>
  );
}
