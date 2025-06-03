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
import { motion } from "framer-motion";
import { useLinkStatus } from "next/link";
import { usePreloadedQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { convertToUIMessages } from "@/lib/convert-to-uimessages";
import { useQuery } from "convex-helpers/react/cache/hooks";
import { Loader2 } from "lucide-react";
import IfChatClient from "./if-chat-client";
import IfNotChatClient from "./if-not-chat-client";
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

export default function ChatClientCopy({
  chatItem,
  chatMessages,
}: ChatClientPropsPartial) {
  const id = useId();
  const pathname = usePathname();
  const chatIdd = useMemo(
    () => pathname.split("/chat/")[1] || undefined,
    [pathname]
  );

  const idChat = useMemo(() => {
    // // console.log("use memo", !!chatItem?.id);
    return chatItem?.id ?? crypto.randomUUID();
  }, [chatItem]);
  if (chatIdd) {
    return (
      <IfChatClient
        chatIdd={chatIdd}
        chatItem={chatItem}
        chatMessages={chatMessages}
        id={id}
        idChat={idChat}
      />
    );
  }

  return <IfNotChatClient id={id} idChat={idChat} />;
}
