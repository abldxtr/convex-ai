"use client";

import type React from "react";

import { useChat } from "@ai-sdk/react";
import {
  Fragment,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { motion } from "framer-motion";

import { SidebarToggle } from "@/components/sidebar-toggle";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import MessageBar from "@/components/message-bar";
import TooltipContainer from "@/components/tooltip-container";
import { useGlobalstate } from "@/context/global-store";
import type { ChatClientPropsPartial } from "@/lib/type";
import { ModelSwitcher } from "@/components/models";
import { searchTools } from "@/lib/chat-tools";

interface ChatClientWithoutIdProps extends ChatClientPropsPartial {
  id: string;
  idChat: string;
}

export default function ChatClientWithoutId({
  id,
  idChat,
}: ChatClientWithoutIdProps) {
  const { setNewChat, setGetError, active, setActive } = useGlobalstate();
  const router = useRouter();
  const endOfMessagesRef = useRef<HTMLDivElement>(null);
  const [showExperimentalModels, setShowExperimentalModels] = useState(false);
  const [selectedModel, setSelectedModel] = useState("");

  // Load model preference from session storage
  useLayoutEffect(() => {
    const storedModel = sessionStorage.getItem("model");
    if (storedModel) {
      setSelectedModel(storedModel);
    }
  }, []);

  // Set up chat with AI SDK
  const {
    messages,
    input,
    handleSubmit,
    stop,
    setInput,
    status,
    setMessages,
    reload,
  } = useChat({
    id: idChat,
    experimental_throttle: 100,
    maxSteps: 2,
    api: "/api/chat",
    initialMessages: undefined,
    experimental_prepareRequestBody: (body) => ({
      id,
      message: body.messages.at(-1),
      chatId: idChat ?? undefined,
      model:
        selectedModel.length > 0
          ? selectedModel
          : "mmd-meta-llama/llama-3.3-8b-instruct:free",
    }),
    onError: (error) => {
      console.log("error", error);
      setGetError(true);
    },
    onFinish: () => {
      console.log("onFinish");
    },
  });

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (status === "submitted") {
      endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, status]);

  // Handle keyboard submission - creates a new chat
  const handleKeyboardSubmit = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
        e.preventDefault();
        if (status !== "ready") {
          toast.error("Please wait for the previous message to be sent");
        } else {
          localStorage.setItem("first-message", input);
          setInput("");
          setActive(true);
          router.push(`/chat/${idChat}`);
        }
      }
    },
    [status, input, setInput, setActive, router, idChat]
  );

  // Handle click submission - creates a new chat
  const handleClickSubmit = useCallback(() => {
    localStorage.setItem("first-message", input);
    setInput("");
    setActive(true);
    router.push(`/chat/${idChat}`);
  }, [input, setInput, setActive, router, idChat]);

  return (
    <div className={cn("stretch flex h-full w-full flex-col")}>
      {/* Header */}
      <div className="px-4 pt-3 pb-1">
        <SidebarToggle />
      </div>

      {/* Message display */}
      {(active || status === "submitted" || status === "streaming") && (
        <MessageBar
          messages={messages}
          endOfMessagesRef={endOfMessagesRef as React.RefObject<HTMLDivElement>}
          status={status}
          reload={reload}
        />
      )}

      {/* Input form */}
      <form
        onSubmit={(e) => e.preventDefault()}
        className={cn(
          "w-full",
          active ? "" : "h-full flex items-center justify-center"
        )}
      >
        <motion.div
          className="md:mb-4 mb-2 w-full px-[16px] sm:px-[0px]"
          layoutId="chat-input"
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          {/* Title */}
          {!active && (
            <div className="px-1 text-pretty whitespace-pre-wrap w-full flex items-center justify-center mb-7 text-[28px] font-normal text-gray-700">
              What can I help with?
            </div>
          )}

          {/* Input container */}
          <div className="flex items-center justify-center">
            <div
              className={cn(
                "border-token-border-default bg-token-bg-primary flex grow",
                "max-w-(--thread-content-max-width) [--thread-content-max-width:32rem]",
                "@[34rem]:[--thread-content-max-width:40rem] @[64rem]:[--thread-content-max-width:48rem]",
                "lg:[--thread-content-max-width:50rem]",
                "cursor-text flex-col items-center justify-center overflow-clip rounded-[28px]",
                "border bg-clip-padding shadow-sm contain-inline-size sm:shadow-lg",
                "dark:bg-[#303030] dark:shadow-none!"
              )}
            >
              <div
                className={cn(
                  "relative w-full p-[10px] flex flex-col justify-between min-h-[120px]"
                )}
              >
                {/* Text input */}
                <Textarea
                  id={id}
                  value={input}
                  autoFocus
                  placeholder="Ask anything"
                  className="field-sizing-content max-h-29.5 min-h-0 resize-none text-[16px] text-[#0d0d0d] placeholder:text-[16px] disabled:opacity-50"
                  onChange={(e) => setInput(e.target.value)}
                  disabled={status === "streaming" || status === "submitted"}
                  onKeyDown={handleKeyboardSubmit}
                />

                {/* Tools and actions */}
                <div className="flex h-[36px] items-center justify-between gap-2">
                  {/* Model switcher */}
                  <div className="flex items-center gap-2">
                    <div>
                      <ModelSwitcher
                        selectedModel={
                          selectedModel.length > 0
                            ? selectedModel
                            : "mmd-meta-llama/llama-3.3-8b-instruct:free"
                        }
                        setSelectedModel={setSelectedModel}
                        showExperimentalModels={showExperimentalModels}
                        attachments={[]}
                        messages={messages}
                        status={status}
                        onModelSelect={(model) => {
                          const isVisionModel = model.vision === true;
                        }}
                      />
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-2">
                    {searchTools.map((tool, index) => {
                      const Icon =
                        index === 1 && input.length > 0
                          ? tool.activeIcon!
                          : index === 1 &&
                              (status === "streaming" || status === "submitted")
                            ? tool.stopIcon!
                            : tool.icon;

                      return (
                        <Fragment key={tool.name}>
                          <TooltipContainer
                            tooltipContent={
                              status === "streaming" || status === "submitted"
                                ? "Stopping..."
                                : tool.description
                            }
                            key={tool.name}
                          >
                            <div
                              key={tool.name}
                              className={cn(
                                "flex h-9 w-9 items-center justify-center rounded-full border fill-[#5d5d5d] hover:cursor-pointer",
                                index === 1 && "bg-black",
                                index === 0 &&
                                  "transition-all duration-300 hover:cursor-pointer hover:bg-gray-100",
                                index === 0 &&
                                  (status === "submitted" ||
                                    status === "streaming") &&
                                  "opacity-50 hover:cursor-not-allowed pointer-events-none"
                              )}
                              onClick={(e) => {
                                if (tool.activeIcon && input.length > 0) {
                                  handleClickSubmit();
                                }
                                if (
                                  tool.stopIcon &&
                                  (status === "streaming" ||
                                    status === "submitted")
                                ) {
                                  stop();
                                }
                              }}
                            >
                              <Icon />
                            </div>
                          </TooltipContainer>
                        </Fragment>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </form>
    </div>
  );
}
