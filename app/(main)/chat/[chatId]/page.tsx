import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { convertToUIMessages } from "@/lib/convert-to-uimessages";
import ChatClientCopy from "../chat-client copy";
import { redirect } from "next/navigation";
import ChatClientWithId from "../chat-client-with-id";

export default async function ChatPage({
  params,
}: {
  params: Promise<{ chatId: string }>;
}) {
  // const chatId = (await params).chatId;
  // const token = await convexAuthNextjsToken();
  const [{ chatId }, token] = await Promise.all([
    params,
    convexAuthNextjsToken(),
  ]);

  const chat = await fetchQuery(
    api.chat.getChatById,
    {
      id: chatId,
    },
    { token }
  );
  if (!chat) {
    return redirect("/chat");
  }

  // return <ChatClientCopy />;
  return (
    <ChatClientWithId
      chatIdd={chatId}
      id={crypto.randomUUID()}
      idChat={chatId ?? crypto.randomUUID()}
    />
  );
}

// const preloaded = await preloadQuery(api.chat.getChatById, {
//   id: chatId,
// });
// console.log({ chat });

// if (!chat || !chatId) {
//   if (!chatId) {
//     return (
//       <>
//         <ChatClientCopy />
//       </>
//     );
//   }

//   return (
//     <>
//       <ChatClientCopy
//       // chatItem={chat.chatItem}
//       // chatMessages={convertToUIMessages(chat.chatMessages)}
//       // preloaded={preloaded}
//       // chatId={chatId}
//       />
//     </>
//   );
// }
