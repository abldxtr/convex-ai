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
  setValue: React.Dispatch<React.SetStateAction<string>>;
  value: string;
  removeValue: () => void;
  setFileState: React.Dispatch<React.SetStateAction<FileWithPreview | null>>;
  FileState: FileWithPreview | null;
  removeFileState: () => void;
  storedFiles: FileMetadata[];
  setStoredFiles: React.Dispatch<React.SetStateAction<FileMetadata[]>>;
  removeStoredFiles: () => void;
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
  const [ff, setF] = useState<string[]>([]);
  const [fileState, setFileState, removeFileState] =
    useLocalStorage<FileWithPreview | null>("FileImg", null);

  const [storedFiles, setStoredFiles, removeStoredFiles] = useLocalStorage<
    FileMetadata[]
  >("FileImg", []);

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
      FileState: fileState,
      setFileState,
      removeFileState,
      storedFiles,
      setStoredFiles,
      removeStoredFiles,
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
      fileState,
      setFileState,
      removeFileState,
    ]
  );

  return (
    <GlobalContext.Provider value={contextValue}>
      {children}
    </GlobalContext.Provider>
  );
}

export function useGlobalstate() {
  const state = React.useContext(GlobalContext);
  if (state === null) {
    throw new Error("useGlobalstate must be used within a GlobalStoreProvider");
  }
  return state;
}
