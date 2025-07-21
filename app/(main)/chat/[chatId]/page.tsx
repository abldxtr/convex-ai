import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { redirect } from "next/navigation";
import ChatClientWithId from "@/components/chat-client-with-id";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { Suspense } from "react";

export const experimental_ppr = true;

export default async function ChatPage({
  params,
}: {
  params: Promise<{ chatId: string }>;
}) {
  const [{ chatId }, token] = await Promise.all([
    params,
    convexAuthNextjsToken(),
  ]);

  if (!token) {
    redirect("/auth");
  }

  if (!chatId) {
    return redirect("/chat");
  }

  const isOwn = fetchQuery(api.chat.getChatByUserId, { chatId }, { token });
  if (!isOwn) {
    redirect("/chat");
  }

  return (
    // <Suspense fallback={<></>}>
    <ChatClientWithId
      chatIdd={chatId}
      id={crypto.randomUUID()}
      idChat={chatId ?? crypto.randomUUID()}
    />
    // </Suspense>
  );
}
