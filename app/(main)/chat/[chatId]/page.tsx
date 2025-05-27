import { fetchQuery } from "convex/nextjs";
import ChatClient from "../chat-client";
import { api } from "@/convex/_generated/api";

export default async function ChatPage({
  params,
}: {
  params: Promise<{ chatId: string }>;
}) {
  const chatId = (await params).chatId;

  //   const chat = await fetchQuery(api.chat.getChat,{

  //   })

  return (
    <>
      <ChatClient chatId={chatId} />
    </>
  );
}
