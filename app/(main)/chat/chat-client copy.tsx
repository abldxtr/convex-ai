"use client";
import { useId, useMemo } from "react";

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
import { usePathname } from "next/navigation";
import { ChatClientPropsPartial } from "@/lib/type";

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
