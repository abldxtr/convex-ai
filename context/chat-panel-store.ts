// store/chat-panel-store.ts
import { create } from "zustand";

interface ChatPanelStore {
  chatRef: React.RefObject<HTMLDivElement> | null;
  setChatRef: (ref: React.RefObject<HTMLDivElement>) => void;

  scrollTarget: number;
  setScrollTarget: (value: number) => void;

  unread: boolean;
  setUnread: (value: boolean) => void;

  hasUserScrolledUp: boolean;
  setHasUserScrolledUp: (value: boolean) => void;
}

export const useChatPanelStore = create<ChatPanelStore>((set) => ({
  chatRef: null,
  setChatRef: (ref) => set({ chatRef: ref }),

  scrollTarget: 0,
  setScrollTarget: (value) => set({ scrollTarget: value }),

  unread: false,
  setUnread: (value) => set({ unread: value }),

  hasUserScrolledUp: false,
  setHasUserScrolledUp: (value) => set({ hasUserScrolledUp: value }),
}));
