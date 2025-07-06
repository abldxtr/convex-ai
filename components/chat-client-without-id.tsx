"use client";

import { useChat } from "@ai-sdk/react";
import React, {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
  useTransition,
} from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { motion, MotionConfig } from "framer-motion";
import { SidebarToggle } from "@/components/sidebar-toggle";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import MessageBar from "@/components/message-bar";
import TooltipContainer from "@/components/tooltip-container";
import { useGlobalstate } from "@/context/global-store";
import { models, ModelSwitcher } from "@/components/models";
import { searchTools } from "@/lib/chat-tools";
import { useFileUpload } from "@/hooks/use-file-upload";
import PreviewImg from "@/components/preview-img";
import { useDirection } from "@/hooks/use-direction";

export default function ChatClientWithoutId() {
  const {
    setGetError,
    active,
    setActive,
    attachments,
    setAttachments,
    setFileExists,
    selectedModel,
    setSelectedModel,
    setDirection,
    visionModel,
    setVisionModel,
    value,
    setValue,
    removeValue,
    removeStoredFiles,
    disableLayout,
    setDisableLayout,
    scrollToBotton,
    setScrollToBotton,
  } = useGlobalstate();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const endOfMessagesRef = useRef<HTMLDivElement>(null);
  const [showExperimentalModels, setShowExperimentalModels] = useState(false);
  const idChat = useMemo(() => crypto.randomUUID(), []);
  const [
    { files, isDragging, errors },
    {
      handleDragEnter,
      handleDragLeave,
      handleDragOver,
      handleDrop,
      openFileDialog,
      removeFile,
      clearFiles,
      getInputProps,
    },
  ] = useFileUpload({
    accept: "image/png,image/jpeg,image/jpg",
    maxSize: 1024 * 1024 * 2,
    multiple: false,
    maxFiles: 1,
  });
  useEffect(() => {
    const hasFile = files.length > 0;
    setFileExists(hasFile);
    // if (hasFile) {
    //   setDisableLayout(true);
    // } else {
    //   setDisableLayout(false);
    // }

    const visionModel = models.some((item) => {
      if (item.value === selectedModel) {
        return item.vision === true;
      } else {
        return false;
      }
    });
    console.log({ visionModel });

    setVisionModel(() => visionModel);

    if (files.length > 0 && !visionModel) {
      setSelectedModel("mmd-google/gemini-2.0-flash-exp:free");
    }
  }, [
    files,
    setFileExists,
    selectedModel,
    setSelectedModel,
    visionModel,
    setVisionModel,
  ]);

  // Load model preference from session storage
  useLayoutEffect(() => {
    setActive(false);
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
    experimental_resume,
    append,
  } = useChat({
    id: idChat,
    experimental_throttle: 100,

    maxSteps: 2,
    api: "/api/chat",
    initialMessages: undefined,
    experimental_prepareRequestBody: (body) => ({
      id: idChat,
      message: body.messages.at(-1),
      chatId: idChat,
      model:
        files.length > 0 && !visionModel
          ? "mmd-google/gemini-2.0-flash-exp:free"
          : selectedModel.length > 0
            ? selectedModel
            : "mmd-gpt-4o",
    }),
    onError: (error) => {
      console.log("error", error);
      setGetError(true);
    },
    onFinish: () => {
      console.log("onFinish");
      startTransition(() => {
        if (attachments.length > 0) {
          setAttachments([]);
          clearFiles();
        }
        sessionStorage.setItem(`disable-scroll`, idChat);

        router.push(`/chat/${idChat}`, {
          scroll: false,
        });
      });
    },
  });

  const handleKeyboardSubmit = useCallback(
    async (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
        if (!scrollToBotton) {
          setScrollToBotton(true);
        }
        if (status !== "ready") {
          toast.error("Please wait for the previous message to be sent");
        } else {
          setActive(true);
          setValue("");
          window.history.pushState({}, "", `/chat/${idChat}`);

          if (files.length > 0) {
            const fileData = files[0].file as any;
            const base64Url = fileData.base64
              ? fileData.base64
              : files[0].preview;

            handleSubmit(undefined, {
              experimental_attachments: [
                {
                  url: base64Url,
                  name: files[0].file.name,
                  contentType: files[0].file.type,
                },
              ],
            });
            clearFiles();
          } else {
            handleSubmit();
          }
        }
      }
    },
    [
      status,
      files,
      handleSubmit,
      setActive,
      idChat,
      clearFiles,
      scrollToBotton,
      setScrollToBotton,
    ]
  );

  const handleClickSubmit = useCallback(() => {
    setActive(true);
    window.history.pushState({}, "", `/chat/${idChat}`);
    setValue("");
    if (!scrollToBotton) {
      setScrollToBotton(true);
    }

    if (files.length > 0) {
      const fileData = files[0].file as any;
      const base64Url = fileData.base64 ? fileData.base64 : files[0].preview;

      handleSubmit(undefined, {
        experimental_attachments: [
          {
            url: base64Url,
            name: files[0].file.name,
            contentType: files[0].file.type,
          },
        ],
      });
      clearFiles();
    } else {
      handleSubmit();
    }
  }, [
    files,
    handleSubmit,
    setActive,
    idChat,
    clearFiles,
    scrollToBotton,
    setScrollToBotton,
  ]);

  useLayoutEffect(() => {
    if (value.length > 0) {
      setInput(value);
    }
  }, []);

  useEffect(() => {
    const handleBeforeUnload = () => {
      removeValue();
      removeStoredFiles();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  return (
    <div className={cn("stretch flex h-full w-full flex-col")}>
      {/* Header */}
      <div className="px-4 pt-3 pb-1 shrink-0 h-[52px]">
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
      <input
        {...getInputProps()}
        className="sr-only"
        aria-label="Upload image file"
      />

      {/* Input form */}
      <form
        onSubmit={(e) => e.preventDefault()}
        className={cn(
          "w-full !transition-none ",
          active ? "" : " h-full flex flex-col items-center justify-center    "
        )}
      >
        <div
          className={cn(
            "px-1 text-pretty whitespace-pre-wrap w-full flex items-center justify-center mb-7 text-[28px] font-normal text-gray-700",
            active && "sr-only"
          )}
        >
          What can I help with?
        </div>

        <MotionConfig transition={{ type: "spring", bounce: 0, duration: 0.4 }}>
          <motion.div
            className="md:mb-4 mb-2 w-full px-[16px] sm:px-[0px]  "
            layoutId={disableLayout ? undefined : "chat-input"}
            layout={disableLayout ? undefined : "position"}
          >
            {/* Input container */}
            <div className="flex items-center justify-center relative !transition-none ">
              <div
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                data-dragging={isDragging || undefined}
                data-files={files.length > 0 || undefined}
                className={cn(
                  "border-token-border-default bg-token-bg-primary flex grow",
                  "max-w-(--thread-content-max-width) [--thread-content-max-width:32rem]",
                  "@[34rem]:[--thread-content-max-width:40rem] @[64rem]:[--thread-content-max-width:48rem]",
                  "lg:[--thread-content-max-width:50rem]",
                  "cursor-text flex-col items-center justify-center  rounded-[28px]",
                  "border bg-clip-padding shadow-sm contain-inline-size sm:shadow-lg",
                  "dark:bg-[#303030] dark:shadow-none! relative ",
                  isDragging && "bg-blue-400"
                )}
              >
                <PreviewImg
                  files={files}
                  clearFiles={clearFiles}
                  removeFile={removeFile}
                />
                <div
                  className={cn(
                    "relative w-full p-[10px] flex flex-col justify-between min-h-26 "
                  )}
                >
                  {/* Text input */}
                  <Textarea
                    value={input}
                    autoFocus
                    placeholder="Ask anything"
                    className="field-sizing-content max-h-29.5  resize-none text-[16px] text-[#0d0d0d] placeholder:text-[16px] disabled:opacity-50 !transition-none "
                    onChange={(e) => {
                      // if (e.target.value.length > 60) {
                      //   setDisableLayout(true);
                      // }
                      const direction = useDirection(e.target.value);
                      setDirection(direction);
                      setInput(e.target.value);
                      setValue(e.target.value);
                    }}
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
                            files.length > 0 && !visionModel
                              ? "mmd-google/gemini-2.0-flash-exp:free"
                              : selectedModel.length > 0
                                ? selectedModel
                                : "mmd-gpt-4o"
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
                      {searchTools.map((tool) => {
                        const isStreaming =
                          status === "streaming" || status === "submitted";
                        const isInputEmpty = input.trim().length === 0;

                        if (tool.name === "StopButton") return null;

                        const Icon =
                          tool.name === "ActionButton"
                            ? isStreaming
                              ? searchTools.find((t) => t.name === "StopButton")
                                  ?.icon || tool.icon
                              : tool.icon
                            : tool.icon;

                        const isDisabled =
                          (tool.name === "upload" && isStreaming) ||
                          (tool.name === "ActionButton" &&
                            isInputEmpty &&
                            !isStreaming);

                        const handleClick = () => {
                          if (tool.name === "upload" && !isStreaming) {
                            // setDisableLayout(true);
                            openFileDialog();
                          }

                          if (tool.name === "ActionButton") {
                            if (isStreaming) {
                              stop();
                            } else if (!isInputEmpty) {
                              handleClickSubmit();
                            }
                          }
                        };

                        return (
                          <TooltipContainer
                            key={tool.name}
                            tooltipContent={
                              isStreaming && tool.name === "ActionButton"
                                ? "Stopping..."
                                : tool.description
                            }
                          >
                            <div
                              className={cn(
                                "flex h-9 w-9 items-center justify-center rounded-full border transition-colors duration-300 fill-[#5d5d5d]",
                                tool.name === "upload" && "hover:bg-gray-100",
                                tool.name === "ActionButton" &&
                                  "bg-black fill-white",
                                isDisabled &&
                                  "opacity-50 pointer-events-none hover:cursor-not-allowed",
                                !isDisabled && "hover:cursor-pointer"
                              )}
                              onClick={handleClick}
                            >
                              <Icon />
                            </div>
                          </TooltipContainer>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </MotionConfig>
      </form>
    </div>
  );
}
