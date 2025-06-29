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

  if (!chatId) {
    return redirect("/chat");
  }

  return (
    <ChatClientWithId
      chatIdd={chatId}
      id={crypto.randomUUID()}
      idChat={chatId ?? crypto.randomUUID()}
    />
  );
}
