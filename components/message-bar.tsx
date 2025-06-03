import type { ChatRequestOptions, UIMessage } from "ai";
import { ArrowDown, Loader2, SparklesIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useScroll } from "@/hooks/use-scroll";
import { useDirection } from "@/hooks/use-direction";
import { MessageTools } from "./message-tools";
import MarkdownRenderer from "./markdown";
import { useLayoutEffect, useEffect } from "react";
import { cx } from "class-variance-authority";
import { motion } from "framer-motion";
import AiLoading, { AiLoading2 } from "./ai-loading";
import { useGlobalstate } from "@/context/global-store";
type MessageBarProps = {
  messages: UIMessage[];
  endOfMessagesRef: React.RefObject<HTMLDivElement> | null;
  status: "error" | "submitted" | "streaming" | "ready";
  reload: (
    chatRequestOptions?: ChatRequestOptions
  ) => Promise<string | null | undefined>;
};

export default function MessageBar({
  messages,
  endOfMessagesRef,
  status,
  reload,
}: MessageBarProps) {
  const { scrollRef, showArrow, clientHeight, scrollHeight, offsetHeight } =
    useScroll({ status, endOfMessagesRef, messages });
  if (messages.length > 0) {
    // console.log("stattttt", status);
    // console.log(messages[messages.length - 1].role);
  }
  const { getError, setGetError } = useGlobalstate();
  // useEffect(() => {
  //   if (getError) {
  //     reload();
  //     setGetError(false);
  //   }
  // }, [getError]);

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
        className="isolate h-full w-full flex-1 overflow-x-clip overflow-y-auto px-4"
        ref={scrollRef}
      >
        <div className="relative z-[9] h-full w-full">
          {messages.map((message, index) => {
            const isLastMessage = messages.length - 1 === index;
            // const isEmptyMessage = message.parts.every((part, i) => {
            //   if (part.type === "text") {
            //     return part.text.length > 0;
            //   }
            //   return true;
            // });
            const isEmptyMessage = false;
            // if (message.role === "assistant" && !isEmptyMessage) {
            //   return null;
            // }
            // status === 'streaming' && messages.length - 1 === index
            return (
              <div key={message.id} className="whitespace-pre-wrap relative ">
                {message.role === "user" &&
                (status === "submitted" || status === "streaming") ? (
                  <>
                    <UserMessage
                      message={message}
                      isLastMessage={isLastMessage}
                      reload={reload}
                    />
                  </>
                ) : message.role === "user" ? (
                  <>
                    <UserMessage
                      message={message}
                      isLastMessage={isLastMessage}
                      reload={reload}
                    />
                  </>
                ) : message.role === "assistant" &&
                  (status === "submitted" || status === "streaming") ? (
                  <>
                    {/* Hmm... */}
                    {/*  isLastMessage &&  */}
                    {/* {(status === "streaming" || status === "submitted") && ( */}
                    {/* <AiLoading /> */}

                    {/* )} */}
                    <AIMessage
                      message={message}
                      status={status}
                      isLastMessage={isLastMessage}
                    />
                  </>
                ) : (
                  <>
                    {/* <AiLoading /> */}

                    <AIMessage
                      message={message}
                      status={status}
                      isLastMessage={isLastMessage}
                    />
                  </>
                )}
              </div>
            );
          })}
          {(status === "submitted" || status === "streaming") &&
            messages.length > 0 &&
            messages[messages.length - 1].role === "user" && <AiLoading2 />}
          {(status === "submitted" || status === "streaming") &&
            messages.length > 0 &&
            messages[messages.length - 1].role === "user" && (
              <div className="h-[220px] w-[20px] flex items-center justify-center " />
            )}
          <div ref={endOfMessagesRef} />
        </div>
      </div>
    </div>
  );
}

export function UserMessage({
  message,
  isLastMessage,
  reload,
}: {
  message: UIMessage;
  isLastMessage: boolean;
  reload: (
    chatRequestOptions?: ChatRequestOptions
  ) => Promise<string | null | undefined>;
}) {
  const { getError, setGetError } = useGlobalstate();

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
      <MessageTools
        message={message}
        role="user"
        isLastMessage={isLastMessage}
        reload={reload}
      />
    </div>
  );
}

export function AIMessage({
  message,
  status,
  isLastMessage,
}: {
  message: UIMessage;
  status: "error" | "submitted" | "streaming" | "ready";
  isLastMessage: boolean;
}) {
  // const textPart = message.parts.find((part) => part.type === "text");
  // console.log("message", JSON.stringify(message, null, 2));
  console.log("status", status);
  console.log("isLastMessage", isLastMessage);

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
                <div
                  key={`${message.id}-${i}`}
                  dir="auto"
                  className={cn("relative", {
                    // "mb-10": true && true,
                  })}
                >
                  {/* {(status === "submitted" || status === "streaming") &&
                    isLastMessage && (
                      <AiLoading />

                      // <ThinkingMessage />
                    )} */}
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

function LoadingSparkAi() {
  return (
    <svg
      data-testid="geist-icon"
      height="16"
      stroke-linejoin="round"
      style={{
        width: "18px",
        height: "18px",
        color: "currentColor",
      }}
      viewBox="0 0 16 16"
      width="16"
    >
      <path
        d="M2.5 0.5V0H3.5V0.5C3.5 1.60457 4.39543 2.5 5.5 2.5H6V3V3.5H5.5C4.39543 3.5 3.5 4.39543 3.5 5.5V6H3H2.5V5.5C2.5 4.39543 1.60457 3.5 0.5 3.5H0V3V2.5H0.5C1.60457 2.5 2.5 1.60457 2.5 0.5Z"
        fill="currentColor"
      ></path>
      <path
        d="M14.5 4.5V5H13.5V4.5C13.5 3.94772 13.0523 3.5 12.5 3.5H12V3V2.5H12.5C13.0523 2.5 13.5 2.05228 13.5 1.5V1H14H14.5V1.5C14.5 2.05228 14.9477 2.5 15.5 2.5H16V3V3.5H15.5C14.9477 3.5 14.5 3.94772 14.5 4.5Z"
        fill="currentColor"
      ></path>
      <path
        d="M8.40706 4.92939L8.5 4H9.5L9.59294 4.92939C9.82973 7.29734 11.7027 9.17027 14.0706 9.40706L15 9.5V10.5L14.0706 10.5929C11.7027 10.8297 9.82973 12.7027 9.59294 15.0706L9.5 16H8.5L8.40706 15.0706C8.17027 12.7027 6.29734 10.8297 3.92939 10.5929L3 10.5V9.5L3.92939 9.40706C6.29734 9.17027 8.17027 7.29734 8.40706 4.92939Z"
        fill="currentColor"
      ></path>
    </svg>
  );
}

export const ThinkingMessage = () => {
  const role = "assistant";

  return (
    <motion.div
      data-testid="message-assistant-loading"
      className="w-full mx-auto max-w-3xl px-4 group/message min-h-96"
      initial={{ y: 5, opacity: 0 }}
      animate={{ y: 0, opacity: 1, transition: { delay: 1 } }}
      data-role={role}
    >
      <div
        className={cx(
          "flex gap-4 group-data-[role=user]/message:px-3 w-full group-data-[role=user]/message:w-fit group-data-[role=user]/message:ml-auto group-data-[role=user]/message:max-w-2xl group-data-[role=user]/message:py-2 rounded-xl",
          {
            "group-data-[role=user]/message:bg-muted": true,
          }
        )}
      >
        <div className="size-8 flex items-center rounded-full justify-center ring-1 shrink-0 ring-border">
          <SparklesIcon size={14} />
        </div>

        <div className="flex flex-col gap-2 w-full">
          <div className="flex flex-col gap-4 text-muted-foreground">
            Hmm...
          </div>
        </div>
      </div>
    </motion.div>
  );
};
