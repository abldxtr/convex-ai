// store/app-sidebar-store.ts
import { create } from "zustand";

interface AppSidebarStore {
  hoveredChat: string | null;
  setHoveredChat: (value: string | null) => void;

  deletingId: string | null;
  setDeletingId: (value: string | null) => void;
}

export const useAppSidebarStore = create<AppSidebarStore>((set) => ({
  hoveredChat: null,
  setHoveredChat: (value) => set({ hoveredChat: value }),

  deletingId: null,
  setDeletingId: (value) => set({ deletingId: value }),
}));
