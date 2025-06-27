import { fetchQuery, preloadQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { redirect } from "next/navigation";
import ChatClientWithId from "../chat-client-with-id";

export default async function ChatPage({
  params,
}: {
  params: Promise<{ chatId: string }>;
}) {
  const [{ chatId }, token] = await Promise.all([
    params,
    convexAuthNextjsToken(),
  ]);

  // const chat = await fetchQuery(
  //   api.chat.getChatById,
  //   {
  //     id: chatId,
  //   },
  //   { token }
  // );
  // if (!chat) {
  //   return redirect("/chat");
  // }

  if (!chatId) {
    return redirect("/chat");
  }

  // const preloaded = await preloadQuery(api.chat.getChatById, {
  //   id: chatId,
  // });

  // if (!preloaded) {
  //   return redirect("/chat");
  // }

  return (
    <ChatClientWithId
      chatIdd={chatId}
      id={crypto.randomUUID()}
      idChat={chatId ?? crypto.randomUUID()}
      // preloaded={preloaded}
    />
  );
}
