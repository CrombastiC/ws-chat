import { useState } from "react";
import ContactList from "@/components/ContactList";
import ChatWindow from "@/components/ChatWindow";
import { useChatStore } from "@/stores/chatStore";
import { useWebSocket } from "@/hooks/useWebSocket";

function ConnectionPanel({ onConnected }: { onConnected: () => void }) {
  const [userId, setUserId] = useState("");
  const [userName, setUserName] = useState("");
  const [serverUrl, setServerUrl] = useState("ws://192.168.1.113:8080");
  const { connect } = useWebSocket();
  const connection = useChatStore((s) => s.connection);

  const handleConnect = () => {
    if (!userId.trim() || !userName.trim()) return;
    useChatStore.getState().setCurrentUserId(userId.trim());
    connect(serverUrl, userId.trim(), userName.trim());
    onConnected();
  };

  return (
    <div className="h-full flex items-center justify-center bg-chat-bg">
      <div className="bg-chat-sidebar rounded-2xl p-8 w-96 shadow-2xl border border-neutral-700/50">
        <h1 className="text-2xl font-bold text-center mb-2">💬 Chat Client</h1>
        <p className="text-neutral-400 text-sm text-center mb-6">
          连接到局域网服务器开始聊天
        </p>

        <div className="space-y-4">
          <div>
            <label className="text-sm text-neutral-300 block mb-1">你的用户 ID</label>
            <input
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="例如: user-tom"
              className="w-full bg-chat-input rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-chat-accent"
            />
          </div>
          <div>
            <label className="text-sm text-neutral-300 block mb-1">你的昵称</label>
            <input
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="例如: Tom"
              className="w-full bg-chat-input rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-chat-accent"
            />
          </div>
          <div>
            <label className="text-sm text-neutral-300 block mb-1">服务器地址</label>
            <input
              value={serverUrl}
              onChange={(e) => setServerUrl(e.target.value)}
              placeholder="ws://192.168.x.x:8080"
              className="w-full bg-chat-input rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-chat-accent font-mono"
            />
          </div>

          <button
            onClick={handleConnect}
            disabled={!userId.trim() || !userName.trim() || connection.status === "connecting"}
            className="w-full py-2.5 rounded-lg bg-chat-accent hover:bg-chat-accent/80 font-medium transition-colors disabled:opacity-40"
          >
            {connection.status === "connecting" ? "连接中..." : connection.status === "connected" ? "已连接 ✓" : "连接"}
          </button>

          {connection.status === "error" && (
            <p className="text-red-400 text-sm text-center">连接失败：{connection.error}</p>
          )}
          {connection.status === "connected" && (
            <p className="text-green-400 text-sm text-center">连接成功！正在进入聊天...</p>
          )}
        </div>

        <div className="mt-6 pt-4 border-t border-neutral-700/50 text-xs text-neutral-500">
          <p className="mb-1">💡 使用方法：</p>
          <p>1. 让对方先启动服务器</p>
          <p>2. 填入对方 IP 和端口</p>
          <p>3. 双方用不同的 user_id 连接即可聊天</p>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [connected, setConnected] = useState(false);
  const connection = useChatStore((s) => s.connection);

  // 只有用户点击了连接且连接成功/连接中，才显示聊天界面
  if (!connected || (connection.status !== "connected" && connection.status !== "connecting")) {
    return <ConnectionPanel onConnected={() => setConnected(true)} />;
  }

  return (
    <div className="h-full flex">
      <ContactList />
      <ChatWindow />
    </div>
  );
}
