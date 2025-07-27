import { create } from "zustand";
import { persist } from "zustand/middleware";
import { FileMetadata } from "@/hooks/use-file-upload";
import { Attachment } from "ai";

interface GlobalState {
  firstText: string;
  setFirstText: (value: string) => void;

  newChat: boolean;
  setNewChat: (value: boolean) => void;

  isNavigating: boolean;
  setIsNavigating: (value: boolean) => void;

  getError: boolean;
  setGetError: (value: boolean) => void;

  active: boolean;
  setActive: (value: boolean) => void;

  direction: "ltr" | "rtl";
  setDirection: (value: "ltr" | "rtl") => void;

  attachments: Attachment[];
  setAttachments: (value: Attachment[]) => void;

  fileExists: boolean;
  setFileExists: (value: boolean) => void;

  selectedModel: string;
  setSelectedModel: (value: string) => void;

  visionModel: boolean;
  setVisionModel: (value: boolean) => void;

  value: string;
  setValue: (value: string) => void;
  removeValue: () => void;

  storedFiles: FileMetadata[];
  setStoredFiles: (value: FileMetadata[]) => void;
  removeStoredFiles: () => void;

  disableLayout: boolean;
  setDisableLayout: (value: boolean) => void;

  scrollToBotton: boolean;
  setScrollToBotton: (value: boolean) => void;

  changeRandomId: boolean;
  setChangeRandomId: (value: boolean) => void;
}

export const useGlobalState = create<GlobalState>()(
  persist(
    (set) => ({
      firstText: "",
      setFirstText: (value) => set({ firstText: value }),

      newChat: false,
      setNewChat: (value) => set({ newChat: value }),

      isNavigating: false,
      setIsNavigating: (value) => set({ isNavigating: value }),

      getError: false,
      setGetError: (value) => set({ getError: value }),

      active: false,
      setActive: (value) => set({ active: value }),

      direction: "ltr",
      setDirection: (value) => set({ direction: value }),

      attachments: [],
      setAttachments: (value) => set({ attachments: value }),

      fileExists: false,
      setFileExists: (value) => set({ fileExists: value }),

      selectedModel: "",
      setSelectedModel: (value) => set({ selectedModel: value }),

      visionModel: false,
      setVisionModel: (value) => set({ visionModel: value }),

      value: "",
      setValue: (value) => set({ value }),
      removeValue: () => set({ value: "" }),

      storedFiles: [],
      setStoredFiles: (files) => set({ storedFiles: files }),
      removeStoredFiles: () => set({ storedFiles: [] }),

      disableLayout: false,
      setDisableLayout: (value) => set({ disableLayout: value }),

      scrollToBotton: false,
      setScrollToBotton: (value) => set({ scrollToBotton: value }),

      changeRandomId: false,
      setChangeRandomId: (value) => set({ changeRandomId: value }),
    }),
    {
      name: "global-store", // برای ذخیره در localStorage
      partialize: (state) => ({
        value: state.value,
        storedFiles: state.storedFiles,
      }),
    }
  )
);
