import { fetchQuery } from "convex/nextjs";
import ChatClient from "../chat-client";
import { api } from "@/convex/_generated/api";
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { redirect } from "next/navigation";
import { Attachment, UIMessage } from "ai";
import { ChatMessage } from "@/lib/type";

export default async function ChatPage({
  params,
}: {
  params: Promise<{ chatId: string }>;
}) {
  const chatId = (await params).chatId;
  const token = await convexAuthNextjsToken();

  function convertToUIMessages(messages: ChatMessage[]): Array<UIMessage> {
    return messages.map((message: ChatMessage) => ({
      id: message.id,
      parts: message.parts as UIMessage["parts"],
      role: message.role as UIMessage["role"],
      // Note: content will soon be deprecated in @ai-sdk/react
      content: "",
      createdAt: message.createdAt,
      experimental_attachments:
        (message.attachments as Array<Attachment>) ?? [],
    }));
  }
  // const []

  const chat = await fetchQuery(
    api.chat.getChatById,
    {
      id: chatId,
    },
    { token }
  );
  console.log({ chat });

  if (!chat) {
    return (
      <>
        <ChatClient />
      </>
    );
  }

  return (
    <>
      <ChatClient
        chatItem={chat.chatItem}
        chatMessages={convertToUIMessages(chat.chatMessages)}
      />
    </>
  );
}
