"use client";

import { Attachment } from "ai";
import React, {
  useState,
  useContext,
  ReactNode,
  Dispatch,
  SetStateAction,
  useMemo,
} from "react";

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
