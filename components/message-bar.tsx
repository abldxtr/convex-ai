import type { UIMessage } from "ai";
import { ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useScroll } from "@/hooks/use-scroll";
import { useDirection } from "@/hooks/use-direction";
import { MessageTools } from "./message-tools";
import MarkdownRenderer from "./markdown";
type MessageBarProps = {
  messages: UIMessage[];
  endOfMessagesRef: React.RefObject<HTMLDivElement> | null;
  status: "error" | "submitted" | "streaming" | "ready";
};

export default function MessageBar({
  messages,
  endOfMessagesRef,
  status,
}: MessageBarProps) {
  const { scrollRef, showArrow, clientHeight } = useScroll();
  return (
    <div className="relative h-full w-full flex-1 overflow-hidden">
      {showArrow && (
        <div
          className={cn(
            "absolute bottom-1 z-[10] flex w-full items-center justify-center"
            // showArrow ? "opacity-100" : "pointer-events-none opacity-0",
          )}
        >
          <div
            className="flex size-[32px] cursor-pointer items-center justify-center rounded-full border bg-gray-100 transition-all duration-300 hover:cursor-pointer hover:bg-gray-200"
            onClick={() => {
              if (status === "streaming") {
                // toast.error("Please wait for the previous message to be sent");
              } else {
                scrollRef.current?.scrollTo({
                  top: clientHeight,
                  behavior: "smooth",
                });
              }
            }}
          >
            <ArrowDown className="size-6 grow-0" />
          </div>
        </div>
      )}
      <div
        className="isolate h-full w-full flex-1 overflow-x-hidden overflow-y-auto px-4"
        ref={scrollRef}
      >
        <div className="relative z-[9] h-full w-full">
          {messages.map((message) => {
            return (
              <div key={message.id} className="whitespace-pre-wrap">
                {message.role === "user" ? (
                  <UserMessage message={message} />
                ) : (
                  <AIMessage message={message} />
                )}
              </div>
            );
          })}

          <div ref={endOfMessagesRef} />
        </div>
      </div>
    </div>
  );
}

export function UserMessage({ message }: { message: UIMessage }) {
  const textPart = message.parts.find((part) => part.type === "text");
  const direction = useDirection(textPart?.text ?? "");

  return (
    <div
      className="group/turn-messages mx-auto max-w-(--thread-content-max-width) [--thread-content-max-width:32rem] @[34rem]:[--thread-content-max-width:40rem] @[64rem]:[--thread-content-max-width:48rem] lg:[--thread-content-max-width:52rem] "
      dir="auto"
    >
      <div
        className={cn(
          "w-full gap-4 text-base focus-visible:outline-hidden md:gap-5 lg:gap-6",
          direction !== "rtl"
            ? "flex items-center justify-start"
            : "flex items-center justify-end"
        )}
        dir="auto"
      >
        {message.parts.map((part, i) => {
          switch (part.type) {
            case "text":
              return (
                <div
                  key={`${message.id}-${i}`}
                  dir="auto"
                  className="flex w-fit rounded-3xl bg-[#e9e9e980] px-5 py-2.5"
                >
                  {part.text}
                </div>
              );
          }
        })}
      </div>
      <MessageTools message={message} role="user" />
    </div>
  );
}

export function AIMessage({ message }: { message: UIMessage }) {
  // const textPart = message.parts.find((part) => part.type === "text");

  return (
    <div className="group/turn-messages mx-auto max-w-(--thread-content-max-width) [--thread-content-max-width:32rem] @[34rem]:[--thread-content-max-width:40rem] @[64rem]:[--thread-content-max-width:48rem] lg:[--thread-content-max-width:52rem] ">
      {/* <div className="group/turn-messages mx-auto max-w-(--thread-content-max-width) [--thread-content-max-width:48rem] @[48rem]:[--thread-content-max-width:48rem] @[64rem]:[--thread-content-max-width:48rem]"></div> */}
      <div
        className="gap-4 rounded-3xl px-5  text-base focus-visible:outline-hidden md:gap-5 lg:gap-6"
        dir="auto"
      >
        {message.parts.map((part, i) => {
          switch (part.type) {
            case "text":
              return (
                <div key={`${message.id}-${i}`} dir="auto">
                  {/* {part.text} */}
                  <MarkdownRenderer content={part.text} />
                </div>
              );
          }
        })}
      </div>
      <MessageTools message={message} role="assistant" />
      {/* <div className="h-[34px]" /> */}
    </div>
  );
}
