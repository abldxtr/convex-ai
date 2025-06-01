"use client";
import { useChat, Message } from "@ai-sdk/react";
import {
  Fragment,
  MouseEvent,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { SidebarToggle } from "@/components/sidebar-toggle";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useMediaQuery } from "usehooks-ts";

import {
  LampIcon,
  EarthIcon,
  MicrophoneIcon,
  PlusIcon,
  MicIcon,
  PaintIcon,
  SpeechIcon,
  ThreeDotsIcon,
  ArrowIcon,
  StopIcon,
} from "@/components/icons";
import MessageBar from "@/components/message-bar";
import { useScroll } from "@/hooks/use-scroll";
import TooltipContainer from "@/components/tooltip-container";
import { toast } from "sonner";
import { useParams, usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { useGlobalstate } from "@/context/global-store";
import { ChatClientProps, ChatClientPropsPartial, chat } from "@/lib/type";
import { ModelSwitcher } from "@/components/models";
import exa from "@/lib/exa";
import { motion } from "framer-motion";
import { useLinkStatus } from "next/link";
type IconComponent = ({ size }: { size?: number }) => React.ReactNode;

const tools = [
  {
    name: "Plus",
    icon: PlusIcon,
    description: "Add photos and files",
  },
  {
    name: "Earth",
    icon: EarthIcon,
    description: "Search the web",
  },
  {
    name: "Lamp",
    icon: LampIcon,
    description: "Think before responding",
  },
  {
    name: "Microphone",
    icon: MicrophoneIcon,
    description: "Get detailed report",
  },
  {
    name: "Paint",
    icon: PaintIcon,
    description: "Visualize anything",
  },
  {
    name: "ThreeDots",
    icon: ThreeDotsIcon,
    description: "View tools",
  },
];

const searchTools = [
  {
    name: "Mic",
    icon: MicIcon as IconComponent,
    description: "Dictate",
  },
  {
    name: "ActionButton",
    icon: SpeechIcon as IconComponent,
    activeIcon: ArrowIcon as IconComponent,
    stopIcon: StopIcon as IconComponent,
    description: "Submit",
  },
];
export default function ChatClient({
  chatItem,
  chatMessages,
}: ChatClientPropsPartial) {
  const { newChat, setNewChat, getError, setGetError } = useGlobalstate();
  const router = useRouter();
  const pathname = usePathname();
  const chatIdd = useMemo(
    () => pathname.split("/chat/")[1] || undefined,
    [pathname]
  );

  const [active, setActive] = useState(false);

  useLayoutEffect(() => {
    if (chatIdd) {
      setActive(true);
    } else {
      setActive(false);
    }
  }, [chatIdd]);

  // const model =
  //   sessionStorage.getItem(`model`) ?? "mmd-meta-llama/llama-4-scout";
  // const [selectedModel, setSelectedModel] = useState(model);
  const [showExperimentalModels, setShowExperimentalModels] = useState(false);
  const [selectedModel, setSelectedModel] = useState(
    "mmd-meta-llama/llama-4-scout"
  );

  useLayoutEffect(() => {
    const storedModel = sessionStorage.getItem("model");
    if (storedModel) {
      setSelectedModel(storedModel);
    }
  }, [chatIdd]);
  // console.log("selectedModel", selectedModel);

  const idChat = useMemo(() => {
    // // console.log("use memo", !!chatItem?.id);
    return chatItem?.id ?? crypto.randomUUID();
  }, [chatItem]);

  // useEffect(() => {
  //   exampleSearch();
  // }, []);

  // console.log("ccccccc", JSON.stringify(chatMessages, null, 2));

  const {
    messages,
    input,
    handleInputChange,
    append,
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
    initialMessages: chatMessages,
    experimental_prepareRequestBody: (body) => {
      // // console.log({ body });
      return {
        id,
        message: body.messages.at(-1),
        chatId: chatIdd,
        model: selectedModel,
      };
    },
    onError: (error) => {
      console.log("error", error);
      setGetError(true);
      // router.refresh();
      // reload();
    },
    onFinish: () => {
      console.log("onFinish");
      router.refresh();
    },
  });

  useEffect(() => {
    if (newChat) {
      setMessages([]);
      setNewChat(false);
    }
  }, [newChat]);

  useEffect(() => {
    const msg = localStorage.getItem("first-message");
    if (msg) {
      append({ id: crypto.randomUUID(), content: msg, role: "user" });
      localStorage.removeItem("first-message");
    }
  }, []);
  const endOfMessagesRef = useRef<HTMLDivElement>(null);
  const id = useId();
  // useEffect(() => {
  //   if (status !== "streaming") {
  //     endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  //   }
  // }, [messages, status]);

  async function sendMessageAndCreateChatKeyBoard(
    e: React.KeyboardEvent<HTMLTextAreaElement>
  ) {
    if (chatIdd == undefined || chatIdd == null) {
      e.preventDefault();
      localStorage.setItem("first-message", input);
      setInput("");

      router.push(`/chat/${idChat}`);
      // setInput("");
    } else {
      e.preventDefault();
      handleSubmit(e);
    }
  }
  async function sendMessageAndCreateChatClick(e: MouseEvent<HTMLDivElement>) {
    if (chatIdd === undefined || chatIdd === null) {
      e.preventDefault();
      localStorage.setItem("first-message", input);
      setInput("");
      router.push(`/chat/${idChat}`);
    } else {
      e.preventDefault();
      handleSubmit(e);
    }
  }
  const { pending } = useLinkStatus();

  return (
    <div
      className={cn(
        "stretch flex h-full w-full flex-col",
        pending &&
          "absolute inset-0 bg-gray-100 opacity-50 pointer-events-none "
      )}
    >
      {/* header */}

      <div className="px-4 pt-3 pb-1">
        <SidebarToggle />
      </div>

      {/* body */}

      {active && (
        <MessageBar
          messages={messages}
          endOfMessagesRef={endOfMessagesRef as React.RefObject<HTMLDivElement>}
          status={status}
          reload={reload}
        />
      )}

      {/* footer */}

      <form
        onSubmit={() => sendMessageAndCreateChatClick}
        className={cn(
          "w-full",
          active ? "" : "h-full flex items-center justify-center"
        )}
      >
        <motion.div
          className="md:mb-4 mb-2 w-full px-[16px] sm:px-[0px]"
          layoutId="chat-input"
          transition={{
            duration: 0.3,
            ease: "easeInOut",
          }}
        >
          <div className="flex items-center justify-center">
            <div
              className={cn(
                "border-token-border-default bg-token-bg-primary flex  grow max-w-(--thread-content-max-width) [--thread-content-max-width:32rem] @[34rem]:[--thread-content-max-width:40rem] @[64rem]:[--thread-content-max-width:48rem]  cursor-text flex-col items-center justify-center overflow-clip rounded-[28px] border bg-clip-padding shadow-sm contain-inline-size sm:shadow-lg dark:bg-[#303030] dark:shadow-none!",
                chatIdd
                  ? "lg:[--thread-content-max-width:50rem]"
                  : "lg:[--thread-content-max-width:50rem]"
              )}
            >
              <div
                className={cn(
                  "relative w-full p-[10px] flex flex-col justify-between ",
                  chatIdd ? "min-h-[100px]" : "min-h-[120px]"
                )}
              >
                <Textarea
                  id={id}
                  value={input}
                  autoFocus
                  placeholder="Ask anything"
                  className="field-sizing-content max-h-29.5 min-h-0 resize-none text-[16px] text-[#0d0d0d] placeholder:text-[16px] disabled:opacity-50"
                  onChange={(e) => setInput(e.target.value)}
                  disabled={status === "streaming" || status === "submitted"}
                  onKeyDown={(e) => {
                    if (
                      e.key === "Enter" &&
                      !e.shiftKey &&
                      !e.nativeEvent.isComposing
                    ) {
                      e.preventDefault();
                      if (status !== "ready") {
                        toast.error(
                          "Please wait for the previous message to be sent"
                        );
                      } else {
                        sendMessageAndCreateChatKeyBoard(e);
                      }
                    }
                  }}
                />
                <div className="flex h-[36px] items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div
                    // className={cn(
                    //   "transition-all duration-300",
                    //   isMobile && isGroupSelectorExpanded
                    //     ? "opacity-0 invisible w-0"
                    //     : "opacity-100 visible w-auto"
                    // )}
                    >
                      <ModelSwitcher
                        selectedModel={selectedModel}
                        setSelectedModel={setSelectedModel}
                        showExperimentalModels={showExperimentalModels}
                        attachments={[]}
                        messages={messages}
                        status={status}
                        onModelSelect={(model) => {
                          // Show additional info about image attachments for vision models
                          const isVisionModel = model.vision === true;
                          // showSwitchNotification(
                          //   model.label,
                          //   isVisionModel
                          //     ? "Vision model enabled - you can now attach images and PDFs"
                          //     : model.description,
                          //   typeof model.icon === "string" ? (
                          //     <img
                          //       src={model.icon}
                          //       alt={model.label}
                          //       className="size-4 object-contain"
                          //     />
                          //   ) : (
                          //     <model.icon className="size-4" />
                          //   ),
                          //   model.color,
                          //   "model" // Explicitly mark as model notification
                          // );
                        }}
                      />
                    </div>
                    {/* {tools.map((tool, index) => {
                      if (index > 3 && !matches) {
                        return null;
                      }
                      return (
                        <TooltipContainer
                          tooltipContent={tool.description}
                          key={tool.name}
                        >
                          <div
                            key={tool.name}
                            className="border-token-border-default text-token-text-secondary can-hover:hover:bg-[#f9f9f9] flex h-9 w-9 items-center justify-center rounded-full border transition-all duration-300 hover:cursor-pointer hover:bg-gray-100"
                            onClick={() => {
                              stop();
                            }}
                          >
                            <tool.icon />
                          </div>
                        </TooltipContainer>
                      );
                    })} */}
                  </div>
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
                                ? "Stooping..."
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
                                  sendMessageAndCreateChatClick(e);
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
