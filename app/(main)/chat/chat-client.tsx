"use client";
import { useChat } from "@ai-sdk/react";
import {
  Fragment,
  MouseEvent,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import { SidebarToggle } from "@/components/sidebar-toggle";
import TextareaComponent from "@/components/text-area";
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
import { ArrowDown } from "lucide-react";
import { useScroll } from "@/hooks/use-scroll";
import TooltipContainer from "@/components/tooltip-container";
import { toast } from "sonner";
import { useParams, usePathname } from "next/navigation";
import { api } from "@/convex/_generated/api";
import { useMutation } from "convex/react";
import { useAction } from "convex/react";
import { internal } from "@/convex/_generated/api";
import { action } from "@/convex/_generated/server";
import { useRouter } from "next/navigation";
import { useGlobalstate } from "@/context/global-store";
// import Messages from "@/components/messages";
// Add this type definition for the icon components
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

// Update the searchTools array with proper typing
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
export default function ChatClient({ chatId }: { chatId: string | undefined }) {
  const { firstText, setFirstText } = useGlobalstate();
  //   if (!!chatId) {
  //     return null;
  //   }
  //   const param = useParams<{ chatId: string }>();
  //   const createChat = useMutation(api.chat.createChat);
  const createChat = useAction(api.agent.createThread);
  //   const [idChat, setIdChat] = useState<string>(
  //     param.chatId ?? crypto.randomUUID()
  //   );
  const idChat = useMemo(() => {
    return chatId ?? crypto.randomUUID();
  }, [chatId]);
  const [isPending, startTransition] = useTransition();

  const router = useRouter();
  const pathname = usePathname();
  const isRedirected = useRef(false); // جلوگیری از چندبار redirect شدن

  const chatIdd = pathname.split("/chat/")[1] || undefined;

  //   const chatId = param.chatId ?? crypto.randomUUID();

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    stop,
    setInput,
    status,
    setMessages,
  } = useChat({
    id: idChat,
    experimental_throttle: 100,
    maxSteps: 2,
    api: "/api/chat",
    experimental_prepareRequestBody: (body) => {
      console.log(body);
      return {
        id,
        message: body.messages.at(-1),
        chatId: idChat,

        // threadId: "ks775p0gkb4rstnpea0wft4e4h7g4yjb",
      };
    },
    onFinish: async () => {
      if (chatId == undefined || chatId?.length === 0) {
        // startTransition(async () => {
        //   const res = await createChat({
        //     prompt: input,
        //     id: "7654321",
        //     userId: "1234567",
        //     isDeleted: false,
        //   });
        //   router.push(`/chat?t=${res.chatId}`);
        // });
      }
    },
  });

  useEffect(() => {
    if (!chatId && messages.length > 0 && !isRedirected.current) {
      const firstMessage = messages[0];
      const newChatId = firstMessage.id; // بسته به اینکه chatId رو کجا ذخیره می‌کنی

      if (newChatId) {
        isRedirected.current = true;
        router.replace(`/chat/${newChatId}`);
      }
    }
  }, [messages, chatId, router]);

  useEffect(() => {
    const msg = localStorage.getItem("first-message");
    if (msg && messages.length === 0) {
      setMessages([{ id: crypto.randomUUID(), content: msg, role: "user" }]);
      setInput(msg);
      handleSubmit();
      localStorage.removeItem("first-message");
    }
  }, []);
  const endOfMessagesRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const matches = useMediaQuery("(min-width: 768px)");
  const { showArrow } = useScroll();
  const id = useId();
  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessageAndCreateChatKeyBoard(
    e: React.KeyboardEvent<HTMLTextAreaElement>
  ) {
    if (chatIdd == undefined || chatIdd == null) {
      //   const res = await createChat({
      //     prompt: input,
      //     id: "7654321",
      //     userId: "1234567",
      //     isDeleted: false,
      //   });
      //   router.push(`/chat/${res.chatId}`);
      // setFirstText(input);
      e.preventDefault();
      localStorage.setItem("first-message", input);
      router.push(`/chat/${idChat}`);
      setInput("");
    } else {
      e.preventDefault();
      handleSubmit(e);
    }
  }
  async function sendMessageAndCreateChatClick(e: MouseEvent<HTMLDivElement>) {
    if (chatIdd == undefined || chatIdd == null) {
      //   const res = await createChat({
      //     prompt: input,
      //     id: "7654321",
      //     userId: "1234567",
      //     isDeleted: false,
      //   });
      //   router.push(`/chat/${res.chatId}`);
      e.preventDefault();
      localStorage.setItem("first-message", input);
      router.push(`/chat/${idChat}`);
      setInput("");
    } else {
      e.preventDefault();
      handleSubmit(e);
    }
  }

  return (
    <div className="stretch flex h-full w-full flex-col">
      {/* header */}

      <div className="px-4 py-3">
        <SidebarToggle />
      </div>

      {/* body */}

      <MessageBar
        messages={messages}
        endOfMessagesRef={endOfMessagesRef as React.RefObject<HTMLDivElement>}
        status={status}
      />

      {/* footer */}

      <form onSubmit={() => sendMessageAndCreateChatClick} className="w-full">
        <div className="mb-8 w-full px-[16px] sm:px-[0px]">
          <div className="flex items-center justify-center">
            <div className="border-token-border-default bg-token-bg-primary flex w-full max-w-[40rem] grow cursor-text flex-col items-center justify-center overflow-clip rounded-[28px] border bg-clip-padding shadow-sm contain-inline-size sm:shadow-lg dark:bg-[#303030] dark:shadow-none!">
              <div className="relative w-full px-3 py-3">
                <Textarea
                  id={id}
                  value={input}
                  placeholder="Ask anything"
                  className="field-sizing-content max-h-29.5 min-h-0 resize-none text-[16px] text-[#0d0d0d] placeholder:text-[16px]"
                  onChange={(e) => setInput(e.target.value)}
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
                <div className="flex h-[48px] items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {tools.map((tool, index) => {
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
                    })}
                  </div>
                  <div className="flex items-center gap-2">
                    {searchTools.map((tool, index) => {
                      const Icon =
                        index === 1 && input.length > 0
                          ? tool.activeIcon!
                          : index === 1 && status === "streaming"
                            ? tool.stopIcon!
                            : tool.icon;

                      return (
                        <Fragment key={tool.name}>
                          <TooltipContainer
                            tooltipContent={tool.description}
                            key={tool.name}
                          >
                            <div
                              key={tool.name}
                              className={cn(
                                "flex h-9 w-9 items-center justify-center rounded-full border fill-[#5d5d5d] hover:cursor-pointer",
                                index === 1 && "bg-black",
                                index === 0 &&
                                  "transition-all duration-300 hover:cursor-pointer hover:bg-gray-100"
                              )}
                              onClick={(e) => {
                                if (tool.activeIcon && input.length > 0) {
                                  sendMessageAndCreateChatClick(e);
                                }
                                if (tool.stopIcon && status === "streaming") {
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
        </div>
      </form>
    </div>
  );
}
