"use client";

import { FileMetadata, FileWithPreview } from "@/hooks/use-file-upload";
import { Attachment } from "ai";
import React, {
  useState,
  useContext,
  ReactNode,
  Dispatch,
  SetStateAction,
  useMemo,
} from "react";
import { useLocalStorage } from "usehooks-ts";

type ContextType = {
  firstText: string;
  setFirstText: Dispatch<SetStateAction<string>>;
  newChat: boolean;
  setNewChat: Dispatch<SetStateAction<boolean>>;
  isNavigating: boolean;
  setIsNavigating: Dispatch<SetStateAction<boolean>>;
  getError: boolean;
  setGetError: Dispatch<SetStateAction<boolean>>;
  active: boolean;
  setActive: Dispatch<SetStateAction<boolean>>;
  direction: "ltr" | "rtl";
  setDirection: Dispatch<SetStateAction<"ltr" | "rtl">>;
  attachments: Array<Attachment>;
  setAttachments: Dispatch<SetStateAction<Array<Attachment>>>;
  fileExists: boolean;
  setFileExists: Dispatch<SetStateAction<boolean>>;
  selectedModel: string;
  setSelectedModel: Dispatch<SetStateAction<string>>;
  visionModel: boolean;
  setVisionModel: Dispatch<SetStateAction<boolean>>;
  value: string;
  setValue: Dispatch<SetStateAction<string>>;
  removeValue: () => void;
  storedFiles: FileMetadata[];
  setStoredFiles: Dispatch<SetStateAction<FileMetadata[]>>;
  removeStoredFiles: () => void;
  disableLayout: boolean;
  setDisableLayout: React.Dispatch<React.SetStateAction<boolean>>;
  scrollToBotton: boolean;
  setScrollToBotton: React.Dispatch<React.SetStateAction<boolean>>;
  changeRandomId: boolean;
  setChangeRandomId: React.Dispatch<React.SetStateAction<boolean>>;
};

const GlobalContext = React.createContext<ContextType | null>(null);

export function GlobalStoreProvider({ children }: { children: ReactNode }) {
  const [firstText, setFirstText] = useState("");
  const [newChat, setNewChat] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [getError, setGetError] = useState(false);
  const [active, setActive] = useState(false);
  const [direction, setDirection] = useState<"ltr" | "rtl">("ltr");
  const [attachments, setAttachments] = useState<Array<Attachment>>([]);
  const [fileExists, setFileExists] = useState(false);
  const [selectedModel, setSelectedModel] = useState("");
  const [visionModel, setVisionModel] = useState(false);
  const [value, setValue, removeValue] = useLocalStorage("InputText", "");
  const [disableLayout, setDisableLayout] = useState(false);
  const [scrollToBotton, setScrollToBotton] = useState(false);
  const [changeRandomId, setChangeRandomId] = useState(false);

  const [storedFiles, setStoredFiles, removeStoredFiles] = useLocalStorage<
    FileMetadata[]
  >("FileImgFiles", []);

  const contextValue = useMemo(
    () => ({
      firstText,
      setFirstText,
      newChat,
      setNewChat,
      isNavigating,
      setIsNavigating,
      getError,
      setGetError,
      active,
      setActive,
      direction,
      setDirection,
      attachments,
      setAttachments,
      fileExists,
      setFileExists,
      selectedModel,
      setSelectedModel,
      visionModel,
      setVisionModel,
      value,
      setValue,
      removeValue,
      storedFiles,
      setStoredFiles,
      removeStoredFiles,
      disableLayout,
      setDisableLayout,
      scrollToBotton,
      setScrollToBotton,
      changeRandomId,
      setChangeRandomId,
    }),
    [
      firstText,
      newChat,
      isNavigating,
      getError,
      active,
      direction,
      attachments,
      fileExists,
      selectedModel,
      visionModel,
      value,
      setValue,
      removeValue,
      storedFiles,
      setStoredFiles,
      removeStoredFiles,
      disableLayout,
      setDisableLayout,
      scrollToBotton,
      setScrollToBotton,
      changeRandomId,
      setChangeRandomId,
    ]
  );

  return (
    <GlobalContext.Provider value={contextValue}>
      {children}
    </GlobalContext.Provider>
  );
}

export function useGlobalstate() {
  const state = useContext(GlobalContext);
  if (state === null) {
    throw new Error("useGlobalstate must be used within a GlobalStoreProvider");
  }
  return state;
}
