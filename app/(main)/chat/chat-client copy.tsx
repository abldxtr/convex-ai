"use client";

import { useId, useLayoutEffect, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { ChatClientPropsPartial } from "@/lib/type";
import ChatClientWithoutId from "./chat-client-without-id";
import ChatClientWithId from "./chat-client-with-id";
import { useGlobalstate } from "@/context/global-store";

export default function ChatClient({
  chatItem,
  chatMessages,
}: ChatClientPropsPartial) {
  const id = useId();
  const pathname = usePathname();
  const router = useRouter();
  const { active, setActive } = useGlobalstate();

  // Memoize the chat ID extraction from pathname
  const chatIdd = useMemo(
    () => pathname.split("/chat/")[1] || undefined,
    [pathname]
  );

  useLayoutEffect(() => {
    if (!chatIdd) {
      setActive(false);
    } else {
      setActive(true);
    }
  }, [chatIdd]);

  // Memoize the chat ID generation/retrieval
  const idChat = useMemo(() => chatItem?.id ?? crypto.randomUUID(), [chatItem]);

  // Render the appropriate component based on whether we have a chat ID
  return chatIdd ? (
    <ChatClientWithId
      chatIdd={chatIdd}
      chatItem={chatItem}
      chatMessages={chatMessages}
      id={id}
      idChat={idChat}
    />
  ) : (
    <ChatClientWithoutId id={id} idChat={idChat} />
  );
}
