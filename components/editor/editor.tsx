"use client";

import { useEffect, useRef } from "react";

import MonacoEditor from "@monaco-editor/react";
import {
  registerCompletion,
  type CompletionRegistration,
  type Monaco,
  type StandaloneCodeEditor,
} from "monacopilot";

export default function Editor() {
  const completionRef = useRef<CompletionRegistration | null>(null);

  const handleMount = (editor: StandaloneCodeEditor, monaco: Monaco) => {
    completionRef.current = registerCompletion(monaco, editor, {
      endpoint: "/api/code-completion",
      language: "javascript",
    });
  };

  useEffect(() => {
    return () => {
      completionRef.current?.deregister();
    };
  }, []);

  return <MonacoEditor language="javascript" onMount={handleMount} />;
}
