"use client";
import type React from "react";
import { useChat } from "@ai-sdk/react";
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useCallback,
  useTransition,
} from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { SidebarToggle } from "@/components/sidebar-toggle";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import MessageBar from "@/components/message-bar";
import TooltipContainer from "@/components/tooltip-container";
import { useGlobalstate } from "@/context/global-store";
import type { ChatClientPropsPartial } from "@/lib/type";
import { models, ModelSwitcher } from "@/components/models";
import { motion, MotionConfig } from "framer-motion";
import { convertToUIMessages } from "@/lib/convert-to-uimessages";
// import {
//   QueryClient,
//   // useQuery as TanstackUseQuery,
//   useQuery,
//   // useSuspenseQuery,
// } from "@tanstack/react-query";
import { searchTools } from "@/lib/chat-tools";
import { useDirection } from "@/hooks/use-direction";
import { useFileUpload } from "@/hooks/use-file-upload";
import PreviewImg from "@/components/preview-img";
import { useFileToBase64 } from "@/hooks/use-file-base64";
import { Doc } from "@/convex/_generated/dataModel";
interface ChatClientWithIdProps extends ChatClientPropsPartial {
  chatIdd: string;
  id: string;
  idChat: string;
}
export default function ChatClientWithId({
  chatIdd,
  id,
  idChat,
  preloaded,
}: ChatClientWithIdProps) {
  // await queryClient.prefetchQuery({
  //   queryKey: ['posts'],
  //   queryFn: getPosts,
  // })
  // const queryClient = new QueryClient();
  const [isPending, startTransition] = useTransition();
  type Chat = {
    chatItem: Doc<"chats">;
    chatMessages: Doc<"vercelAiMessages">[];
  } | null;

  const {
    newChat,
    setNewChat,
    setGetError,
    active,
    setActive,
    setDirection,
    setFileExists,
    selectedModel,
    setSelectedModel,
    visionModel,
    setVisionModel,
    value,
    setValue,
    removeValue,
    removeStoredFiles,
    disableLayout,
    setDisableLayout,
  } = useGlobalstate();
  const router = useRouter();
  const endOfMessagesRef = useRef<HTMLDivElement>(null);
  const [showExperimentalModels, setShowExperimentalModels] = useState(false);
  const { attachments, setAttachments, scrollToBotton, setScrollToBotton } =
    useGlobalstate();
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
    // initialFiles
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
    const storedModel = sessionStorage.getItem("model");
    if (storedModel) {
      setSelectedModel(storedModel);
    }
    if (chatIdd) {
      setActive(true);
    } else {
      setActive(false);
    }
  }, [chatIdd]);
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
    append,
    experimental_resume,
  } = useChat({
    id: idChat,
    experimental_throttle: 100,
    maxSteps: 2,
    api: "/api/chat",
    // initialMessages: clientGetChatMessages?.chatMessages
    //   ? convertToUIMessages(clientGetChatMessages.chatMessages)
    //   : undefined,
    experimental_prepareRequestBody: (body) => ({
      id,
      message: body.messages.at(-1),
      chatId: chatIdd,
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
      startTransition(async () => {
        console.log("onFinish");
        if (attachments.length > 0) {
          setAttachments([]);
          // clearFiles();
        }
        // refetch()
        // queryClient.invalidateQueries({
        //   queryKey: ["posts", chatIdd],
        // });
      });
    },
  });
  console.log({ status });
  console.log({ messages });

  // const {
  //   data: clientGetChatMessages,
  //   refetch,
  //   isPending: ispending,
  // } = useQuery({
  //   queryKey: ["posts", chatIdd],
  //   queryFn: async ({ queryKey }) => {
  //     const [, chatId] = queryKey;
  //     const res = await fetchChatData(chatId);
  //     return res;
  //     // if (res === null) {
  //     //   return router.push("/chat");
  //     // }
  //     // if (res && res?.chatMessages && res.chatMessages.length > 0) {
  //     //   setMessages(convertToUIMessages(res.chatMessages));
  //     // }
  //     // return "dddd";
  //   },
  //   refetchOnWindowFocus: false,
  // });

  useEffect(() => {
    async function fetchChatData(chatId: string): Promise<Chat> {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_URL}/api/user-data?chatId=${chatId}`,
        {
          method: "GET",
        }
      );
      if (!response.ok) {
        throw new Error("Failed to fetch chat messages");
      }
      const json = await response.json();
      if (json === null) {
        return null;
      }
      const chatData: Chat = {
        chatItem: json.chat.chatItem,
        chatMessages: json.chat.chatMessages,
      };
      return chatData;
    }

    const fetchData = async () => {
      try {
        const clientGetChatMessages = await fetchChatData(chatIdd);
        if (
          clientGetChatMessages?.chatMessages &&
          clientGetChatMessages.chatMessages.length > 0
        ) {
          setMessages(convertToUIMessages(clientGetChatMessages.chatMessages));
        }
      } catch (error) {
        console.error("Error fetching chat messages:", error);
      }
    };

    fetchData();
  }, []);

  // Handle new chat state
  useEffect(() => {
    if (newChat) {
      setMessages([]);
      setNewChat(false);
    }
  }, [newChat, setMessages, setNewChat]);
  // useEffect(() => {
  //   if (
  //     clientGetChatMessages?.chatMessages &&
  //     clientGetChatMessages.chatMessages.length > 0
  //   ) {
  //     setMessages(convertToUIMessages(clientGetChatMessages.chatMessages));
  //   }
  // }, [clientGetChatMessages, setMessages]);
  useLayoutEffect(() => {
    // if (
    //   messages.length === 0 &&
    //   clientGetChatMessages !== null &&
    //   clientGetChatMessages?.chatMessages &&
    //   clientGetChatMessages.chatMessages.length > 0
    // ) {
    //   setMessages(convertToUIMessages(clientGetChatMessages.chatMessages));
    // }
    if (value.length > 0) {
      setInput(value);
    }
  }, []);
  // Handle keyboard submission
  const handleKeyboardSubmit = useCallback(
    async (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
        if (!scrollToBotton) {
          setScrollToBotton(true);
        }
        // e.preventDefault();
        if (status !== "ready") {
          toast.error("Please wait for the previous message to be sent");
        } else {
          // setInput("");
          setValue("");
          setActive(true);
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
    [status, handleSubmit, scrollToBotton, setScrollToBotton]
  );
  // Handle click submission
  const handleClickSubmit = useCallback(async () => {
    setActive(true);
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
    input,
    setInput,
    setActive,
    router,
    idChat,
    attachments,
    scrollToBotton,
    setScrollToBotton,
  ]);
  const stopIcon = searchTools.find((t) => t.name === "StopButton")?.icon;
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
    <div className={cn(" flex h-full w-full flex-col")}>
      {/* Header */}
      <div className="px-4 pt-3 pb-1 shrink-0 h-[52px] ">
        <SidebarToggle />
      </div>
      {messages.length > 0 && (
        <MessageBar
          messages={messages}
          endOfMessagesRef={endOfMessagesRef as React.RefObject<HTMLDivElement>}
          status={status}
          reload={reload}
        />
      )}
      {messages.length === 0 && (
        <div className="relative h-full w-full flex-1 overflow-hidden fade-in bg-red-300 " />
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
          "w-full bg-transparent  ",
          active ? "" : " flex items-center justify-center"
        )}
      >
        <MotionConfig transition={{ type: "spring", bounce: 0, duration: 0.4 }}>
          <motion.div
            className="md:mb-4  w-full sm:px-[16px] md:px-[0px] bg-transparent  "
            layoutId={disableLayout ? undefined : "chat-input"}
            layout={disableLayout ? false : "position"}
          >
            {/* Input container */}
            <div
              className="flex items-center justify-center relative bg-transparent "
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              data-dragging={isDragging || undefined}
              data-files={files.length > 0 || undefined}
            >
              <div
                className={cn(
                  "border-token-border-default bg-token-bg-primary flex grow containerW ",
                  // "max-w-(--thread-content-max-width) [--thread-content-max-width:32rem]",
                  // "@[34rem]:[--thread-content-max-width:40rem] @[64rem]:[--thread-content-max-width:48rem]",
                  // "lg:[--thread-content-max-width:50rem]",
                  "cursor-text flex-col items-center justify-center md:rounded-[28px] rounded-t-[28px] sm:rounded-[28px]  ",
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
                    "relative w-full p-[10px] flex flex-col justify-between min-h-28"
                  )}
                >
                  {/* Text input */}
                  <Textarea
                    id={id}
                    value={input}
                    // autoFocus
                    placeholder="Ask anything"
                    className={cn(
                      "field-sizing-content max-h-29.5  resize-none text-[16px] text-[#0d0d0d] placeholder:text-[16px] disabled:opacity-50"
                    )}
                    onChange={(e) => {
                      if (e.target.value.length > 60) {
                        setDisableLayout(true);
                      }
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
                            // Show additional info about image attachments for vision models
                            const isVisionModel = model.vision === true;
                          }}
                        />
                      </div>
                    </div>
                    {/* Action buttons */}
                    <div className="flex items-center gap-2">
                      {searchTools.map(({ name, icon, description }) => {
                        const isStreaming =
                          status === "streaming" || status === "submitted";
                        const isInputEmpty = input.trim().length === 0;
                        if (name === "StopButton") return null;
                        const Icon =
                          name === "ActionButton" && isStreaming && stopIcon
                            ? stopIcon
                            : icon;
                        const isDisabled =
                          (name === "upload" && isStreaming) ||
                          (name === "ActionButton" &&
                            isInputEmpty &&
                            !isStreaming);
                        const handleClick = () => {
                          if (name === "upload" && !isStreaming) {
                            // setDisableLayout(true);
                            openFileDialog();
                          }
                          if (name === "ActionButton") {
                            if (isStreaming) {
                              stop();
                            } else if (!isInputEmpty) {
                              handleClickSubmit();
                            }
                          }
                        };
                        const tooltip =
                          isStreaming && name === "ActionButton"
                            ? "Stopping..."
                            : description;
                        return (
                          <TooltipContainer key={name} tooltipContent={tooltip}>
                            <div
                              className={cn(
                                "flex h-9 w-9 items-center justify-center rounded-full border transition-colors duration-300 fill-[#5d5d5d]",
                                name === "upload" && "hover:bg-gray-100",
                                name === "ActionButton" &&
                                  "bg-black fill-white",
                                isDisabled
                                  ? "opacity-50 pointer-events-none hover:cursor-not-allowed"
                                  : "hover:cursor-pointer"
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
