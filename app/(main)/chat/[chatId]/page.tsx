import { fetchQuery } from "convex/nextjs";
import ChatClient from "../chat-client";
import { api } from "@/convex/_generated/api";
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { redirect } from "next/navigation";

export default async function ChatPage({
  params,
}: {
  params: Promise<{ chatId: string }>;
}) {
  const chatId = (await params).chatId;
  const token = await convexAuthNextjsToken();
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
      <ChatClient chatItem={chat.chatItem} chatMessages={chat.chatMessages} />
    </>
  );
}
