import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { redirect } from "next/navigation";
import ChatClientWithId from "@/components/chat-client-with-id";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { getQueryClient } from "@/provider/get-query-client";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

// export const dynamic = "force-static";

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

  const queryClient = getQueryClient();

  void queryClient.prefetchQuery({
    queryKey: ["posts", chatId],
    queryFn: async ({ queryKey }) => {
      const [, chatId] = queryKey;
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_URL}/api/user-data?chatId=${chatId}`,
        {
          method: "GET",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch chat messages");
      }

      const json = await response.json();
      console.log("ddddddddddddddddddddddddddddddd");

      console.log(json);

      return json.chat;
    },
  });

  return (
    <>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <ChatClientWithId
          chatIdd={chatId}
          id={crypto.randomUUID()}
          idChat={chatId ?? crypto.randomUUID()}
        />
      </HydrationBoundary>
    </>
  );
}
