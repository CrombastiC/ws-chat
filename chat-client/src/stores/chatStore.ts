import { create } from "zustand";
import type { ChatMessage, Contact, ConnectionState } from "@/types/message";

interface ChatState {
  // Connection
  connection: ConnectionState;
  setConnection: (state: Partial<ConnectionState>) => void;

  // Current user
  currentUserId: string;
  setCurrentUserId: (id: string) => void;

  // Contacts
  contacts: Contact[];
  setContacts: (contacts: Contact[]) => void;
  updateContact: (id: string, updates: Partial<Contact>) => void;

  // Active chat
  activeContactId: string | null;
  setActiveContactId: (id: string | null) => void;

  // Messages (keyed by contact id)
  messages: Record<string, ChatMessage[]>;
  addMessage: (contactId: string, message: ChatMessage) => void;
  updateMessage: (
    contactId: string,
    messageId: string,
    updates: Partial<ChatMessage>
  ) => void;
  setMessages: (contactId: string, messages: ChatMessage[]) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  connection: {
    status: "disconnected",
    url: "ws://localhost:8080/ws",
  },
  setConnection: (state) =>
    set((prev) => ({ connection: { ...prev.connection, ...state } })),

  currentUserId: "",
  setCurrentUserId: (id) => set({ currentUserId: id }),

  contacts: [],
  setContacts: (contacts) => set({ contacts }),
  updateContact: (id, updates) =>
    set((prev) => ({
      contacts: prev.contacts.map((c) =>
        c.id === id ? { ...c, ...updates } : c
      ),
    })),

  activeContactId: null,
  setActiveContactId: (id) => set({ activeContactId: id }),

  messages: {},
  addMessage: (contactId, message) =>
    set((prev) => ({
      messages: {
        ...prev.messages,
        [contactId]: [...(prev.messages[contactId] || []), message],
      },
    })),
  updateMessage: (contactId, messageId, updates) =>
    set((prev) => ({
      messages: {
        ...prev.messages,
        [contactId]: (prev.messages[contactId] || []).map((m) =>
          m.id === messageId ? { ...m, ...updates } : m
        ),
      },
    })),
  setMessages: (contactId, messages) =>
    set((prev) => ({
      messages: { ...prev.messages, [contactId]: messages },
    })),
}));
