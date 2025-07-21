// store/chat-messages-store.ts
import { create } from "zustand";

interface ChatMessagesStore {
  scrollAnchor: HTMLDivElement | null;
  setScrollAnchor: (el: HTMLDivElement | null) => void;
}

export const useChatMessagesStore = create<ChatMessagesStore>((set) => ({
  scrollAnchor: null,
  setScrollAnchor: (el) => set({ scrollAnchor: el }),
}));
