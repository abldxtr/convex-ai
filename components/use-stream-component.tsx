// import { type StreamId } from "@convex-dev/persistent-text-streaming";
//load the library to client only
// import dynamic from "next/dynamic";
// const PersistentTextStreaming = dynamic(
//   () =>
//     import("@convex-dev/persistent-text-streaming/react").then(
//       (mod) => mod.default,
//     ),
//   {
//     ssr: false,
//   },
// );
import { useMemo, useEffect } from "react";
import { useStream } from "@convex-dev/persistent-text-streaming/react";
import type { StreamId } from "@convex-dev/persistent-text-streaming";
import { Doc } from "@/convex/_generated/dataModel";
import { api } from "@/convex/_generated/api";
// import Markdown from "react-markdown";

export function ServerMessage({
  message,
  isDriven,
  //   stopStreaming,
  //   scrollToBottom,
}: {
  message: Doc<"chats">;
  isDriven: boolean;
  //   stopStreaming: () => void;
  //   scrollToBottom: () => void;
}) {
  // if (message === undefined) {
  //   return null;
  // }
  const { text, status } = useStream(
    api.streaming.getStreamBody,
    new URL(`https://aware-barracuda-585.convex.site/chat-stream`),
    isDriven,
    message?.stream as StreamId
  );

  const isCurrentlyStreaming = useMemo(() => {
    if (!isDriven) return false;
    return status === "pending" || status === "streaming";
  }, [isDriven, status]);

  // useEffect(() => {
  //   if (!isDriven) return;
  //   if (isCurrentlyStreaming) return;
  //   stopStreaming();
  // }, [isDriven, isCurrentlyStreaming, stopStreaming]);

  // useEffect(() => {
  //   if (!text) return;
  //   scrollToBottom();
  // }, [text, scrollToBottom]);

  return (
    <div className="md-answer">
      {/* <Markdown>{text || "Thinking..."}</Markdown> */}
      {text || "Thinking..."}
      {/* {status === "error" && (
        <div className="mt-2 text-red-500">Error loading response</div>
      )} */}
    </div>
  );
}
