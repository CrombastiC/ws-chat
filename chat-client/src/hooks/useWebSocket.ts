import { useEffect, useRef, useCallback } from "react";
import { useChatStore } from "@/stores/chatStore";
import type { ChatMessage } from "@/types/message";

export function useWebSocket() {
  const wsRef = useRef<WebSocket | null>(null);
  const currentUserId = useChatStore((s) => s.currentUserId);
  const setConnection = useChatStore((s) => s.setConnection);
  const addMessage = useChatStore((s) => s.addMessage);
  const setContacts = useChatStore((s) => s.setContacts);
  const updateContact = useChatStore((s) => s.updateContact);

  const handleMessage = useCallback(
    (text: string) => {
      try {
        const msg: ChatMessage = JSON.parse(text);

        if (msg.type === "system") {
          console.log("[系统]", msg.content);
          return;
        }

        const contactId = msg.from;

        const contacts = useChatStore.getState().contacts;
        if (!contacts.find((c) => c.id === contactId)) {
          setContacts([
            ...contacts,
            { id: contactId, name: msg.from, online: true, unreadCount: 0 },
          ]);
        }

        addMessage(contactId, { ...msg, status: "delivered" });
        updateContact(contactId, {
          lastMessage: msg.type === "text" ? msg.content : `📎 ${msg.file_meta?.name || "文件"}`,
          lastMessageTime: msg.timestamp,
        });
      } catch {
        console.error("消息解析失败:", text);
      }
    },
    [addMessage, setContacts, updateContact]
  );

  const connect = useCallback(
    (url: string, userId: string, userName: string) => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.close();
      }

      setConnection({ status: "connecting", url });

      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("[WS] 已连接");
        setConnection({ status: "connected", url });
        ws.send(JSON.stringify({ user_id: userId, user_name: userName }));
      };

      ws.onmessage = (event) => {
        handleMessage(event.data);
      };

      ws.onclose = () => {
        console.log("[WS] 连接关闭");
        setConnection({ status: "disconnected", url });
      };

      ws.onerror = () => {
        console.error("[WS] 连接错误");
        setConnection({ status: "error", url, error: "连接失败" });
      };
    },
    [handleMessage, setConnection]
  );

  const sendMessage = useCallback(
    (to: string, content: string, type: "text" | "file" = "text") => {
      if (wsRef.current?.readyState !== WebSocket.OPEN) {
        console.error("[WS] 未连接");
        return null;
      }

      const msg: ChatMessage = {
        id: crypto.randomUUID(),
        type,
        from: currentUserId,
        to,
        content,
        timestamp: Date.now(),
        status: "sent",
      };

      wsRef.current.send(JSON.stringify(msg));
      addMessage(to, msg);
      return msg.id;
    },
    [currentUserId, addMessage]
  );

  const disconnect = useCallback(() => {
    wsRef.current?.close();
    wsRef.current = null;
  }, []);

  useEffect(() => {
    return () => {
      wsRef.current?.close();
    };
  }, []);

  return { connect, sendMessage, disconnect };
}
