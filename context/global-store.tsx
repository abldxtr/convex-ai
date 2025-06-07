"use client";

import React, {
  useState,
  useContext,
  ReactNode,
  Dispatch,
  SetStateAction,
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
};

const GlobalContext = React.createContext<ContextType | null>(null);

export function GlobalStoreProvider({ children }: { children: ReactNode }) {
  const [firstText, setFirstText] = useState("");
  const [newChat, setNewChat] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [getError, setGetError] = useState(false);
  const [active, setActive] = useState(false);
  const [direction, setDirection] = useState<"ltr" | "rtl">("ltr");

  return (
    <GlobalContext.Provider
      value={{
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
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
}

export function useGlobalstate() {
  const State = React.useContext(GlobalContext);
  if (State === null) {
    throw new Error("useMessage must be used within a CounterProvider");
  }

  return State;
}
