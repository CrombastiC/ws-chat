import { useChatStore } from "@/stores/chatStore";
import type { Contact } from "@/types/message";

function formatTime(ts?: number): string {
  if (!ts) return "";
  const d = new Date(ts);
  const now = new Date();
  if (d.toDateString() === now.toDateString()) {
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

function ContactItem({
  contact,
  active,
  onClick,
}: {
  contact: Contact;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
        active
          ? "bg-chat-accent/30"
          : "hover:bg-chat-hover"
      }`}
    >
      <div className="relative">
        <div className="w-10 h-10 rounded-full bg-chat-accent flex items-center justify-center text-sm font-semibold">
          {contact.name.slice(0, 2).toUpperCase()}
        </div>
        <span
          className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-chat-sidebar ${
            contact.online ? "bg-green-400" : "bg-gray-500"
          }`}
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-baseline">
          <span className="font-medium truncate">{contact.name}</span>
          <span className="text-xs text-neutral-400">
            {formatTime(contact.lastMessageTime)}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-neutral-400 truncate">
            {contact.lastMessage || "No messages yet"}
          </span>
          {contact.unreadCount > 0 && (
            <span className="bg-chat-accent text-xs rounded-full px-2 py-0.5 min-w-[20px] text-center">
              {contact.unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

export default function ContactList() {
  const contacts = useChatStore((s) => s.contacts);
  const activeId = useChatStore((s) => s.activeContactId);
  const setActive = useChatStore((s) => s.setActiveContactId);

  return (
    <div className="w-72 bg-chat-sidebar border-r border-neutral-700/50 flex flex-col h-full">
      <div className="p-4 border-b border-neutral-700/50">
        <h1 className="text-lg font-bold">Messages</h1>
      </div>
      <div className="flex-1 overflow-y-auto">
        {contacts.map((c) => (
          <ContactItem
            key={c.id}
            contact={c}
            active={c.id === activeId}
            onClick={() => setActive(c.id)}
          />
        ))}
        {contacts.length === 0 && (
          <p className="p-4 text-sm text-neutral-500 text-center">
            No contacts yet
          </p>
        )}
      </div>
    </div>
  );
}
