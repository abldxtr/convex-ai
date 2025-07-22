import type { ChatRequestOptions, UIMessage } from "ai";
import { ArrowDown, SparklesIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useScroll } from "@/hooks/use-scroll";
import { useDirection } from "@/hooks/use-direction";
import { MessageTools } from "./message-tools";
import MarkdownRenderer from "./markdown";
import { cx } from "class-variance-authority";
import { motion, AnimatePresence } from "framer-motion";
import { AiLoading2 } from "./ai-loading";
// import { useGlobalstate } from "@/context/global-store";
import { useGlobalState } from "@/context/global-state-zus";

import { clientGetChatMessages } from "@/lib/type";
import { PreviewAttachment } from "./preview-attachment";
import { AIMessageError } from "./error-message-ai";
import EditMessage from "./edit-message";
import { ScrollArea } from "./ui/scroll-area";
import { AnimatedMarkdown } from "flowtoken";
import "flowtoken/dist/styles.css";
import { useEffect } from "react";
type MessageBarProps = {
  messages: UIMessage[];
  clientChatMessage?: clientGetChatMessages;
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
  clientChatMessage,
}: MessageBarProps) {
  const { scrollRef, showArrow, clientHeight } = useScroll({
    status,
    endOfMessagesRef,
    messages,
  });
  // if (messages.length > 0) {
  // }
  const { getError, setGetError } = useGlobalState();
  useEffect(() => {
    if (getError) {
      setGetError(false);
      reload();
    }
  }, [getError]);

  return (
    // <AnimatePresence>
    <div
      className="relative h-full w-full flex-1 overflow-hidden fade-in "
      // initial={{
      //   opacity: 0,
      // }}
      // animate={{
      //   opacity: 1,
      // }}
      // exit={{
      //   opacity: 0,
      // }}
    >
      {showArrow && (
        <div
          className={cn(
            "absolute bottom-1 z-[10] flex w-full items-center justify-center"
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
        className="isolate h-full w-full flex-1 overflow-x-clip px-4 overflow-y-scroll "
        ref={scrollRef}
      >
        {/* <ScrollArea className="relative z-[9] h-full w-full"> */}
        {messages.map((message, index) => {
          const isLastMessage = messages.length - 1 === index;
          return (
            <div key={message.id} className=" relative ">
              {/* whitespace-pre-wrap */}
              {message.role === "user" &&
              (status === "submitted" || status === "streaming") ? (
                <>
                  <UserMessage
                    message={message}
                    isLastMessage={isLastMessage}
                    reload={reload}
                  />
                  {/* <EditMessage message={message} /> */}
                </>
              ) : message.role === "user" ? (
                <>
                  <UserMessage
                    message={message}
                    isLastMessage={isLastMessage}
                    reload={reload}
                  />
                  {/* <EditMessage message={message} /> */}
                </>
              ) : message.role === "assistant" &&
                (status === "submitted" || status === "streaming") ? (
                <>
                  <AIMessage
                    message={message}
                    status={status}
                    isLastMessage={isLastMessage}
                  />
                </>
              ) : (
                <>
                  <AIMessage
                    message={message}
                    status={status}
                    isLastMessage={isLastMessage}
                  />
                </>
              )}

              {/* delete mmmmmmmmmmmm */}
              {getError && isLastMessage && status === "error" && (
                <AIMessageError reload={reload} />
              )}
            </div>
          );
        })}
        {(status === "submitted" || status === "streaming") &&
          messages.length > 0 &&
          messages[messages.length - 1].role === "user" && <AiLoading2 />}
        {(status === "submitted" ||
          status === "streaming" ||
          status === "ready" ||
          status === "error") &&
          messages.length > 0 && (
            // messages[messages.length - 1].role === "user" && (
            <div className="h-[220px] w-[20px] flex items-center justify-center " />
          )}
        {/* {isLastMessage && (
              // messages[messages.length - 1].role === "user" && (
              <div className="h-[220px] w-[20px] flex items-center justify-center " />
            )} */}
        <div ref={endOfMessagesRef} />
        {/* </div> */}
        {/* </ScrollArea> */}
      </div>
    </div>
    // </AnimatePresence>
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
  const textPart = message.parts.find((part) => part.type === "text");
  const direction = useDirection(textPart?.text ?? "");

  return (
    <div className="group/turn-messages mx-auto containerW " dir="auto">
      <div
        className={cn(
          "w-full gap-4 text-base focus-visible:outline-hidden md:gap-5 lg:gap-6 break-words break-all ",
          direction !== "rtl"
            ? "flex items-center justify-start font-sans  "
            : "flex items-center justify-end font-vazirmatn "
        )}
        dir="auto"
      >
        <div
          className="flex w-fit max-w-full break-words rounded-3xl bg-[#e9e9e980] p-1  flex-col"
          dir={direction}
        >
          {message.experimental_attachments &&
            message.experimental_attachments.length > 0 && (
              <div
                data-testid={`message-attachments`}
                className="w-full  h-auto "
              >
                {message.experimental_attachments.map((attachment) => {
                  return (
                    <PreviewAttachment
                      key={attachment.url}
                      attachment={attachment}
                    />
                  );
                })}
              </div>
            )}
          {message.parts.map((part, i) => {
            switch (part.type) {
              case "text":
                return (
                  <div
                    key={`${message.id}-${i}`}
                    dir="auto"
                    className="flex w-fit max-w-full break-words  px-5 py-2.5 !text-[14px]  "
                  >
                    {part.text}
                  </div>
                );
            }
          })}
        </div>
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
  const textPart = message.parts.find((part) => part.type === "text");
  const direction = useDirection(textPart?.text ?? "");
  return (
    <div className={cn("group/turn-messages mx-auto containerW ")}>
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
                  className={cn(
                    "relative",
                    direction !== "rtl" ? " font-sans  " : "font-vazirmatn "
                  )}
                >
                  <MarkdownRenderer content={part.text} />
                </div>
              );
          }
        })}
      </div>
      <MessageTools message={message} role="assistant" />
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
