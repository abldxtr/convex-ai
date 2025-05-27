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
};

const GlobalContext = React.createContext<ContextType | null>(null);

export function GlobalStoreProvider({ children }: { children: ReactNode }) {
  const [firstText, setFirstText] = useState("");

  return (
    <GlobalContext.Provider
      value={{
        firstText,
        setFirstText,
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
