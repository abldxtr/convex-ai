import { fetchQuery, preloadQuery } from "convex/nextjs";
import ChatClient from "../chat-client";
import { api } from "@/convex/_generated/api";
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { redirect } from "next/navigation";
import { Attachment, UIMessage } from "ai";
import { ChatMessage } from "@/lib/type";
import exa from "@/lib/exa";
import { convertToUIMessages } from "@/lib/convert-to-uimessages";
import ChatClientCopy from "../chat-client copy";

export const dynamic = "force-dynamic";

export default async function ChatPage({
  params,
}: {
  params: Promise<{ chatId: string }>;
}) {
  const chatId = (await params).chatId;
  const token = await convexAuthNextjsToken();

  // async function exampleSearch() {
  //   try {
  //     const result = await exa.searchAndContents("elsa jean pornstar", {
  //       type: "neural",
  //       numResults: 3,
  //       text: true,
  //     });

  //     console.log(JSON.stringify(result, null, 2));
  //   } catch (error) {
  //     console.error("Error:", error);
  //   }
  // }
  // exampleSearch();
  // const []

  const chat = await fetchQuery(
    api.chat.getChatById,
    {
      id: chatId,
    },
    { token }
  );

  // const preloaded = await preloadQuery(api.chat.getChatById, {
  //   id: chatId,
  // });
  // console.log({ chat });

  if (!chat) {
    // return redirect("/chat");
    return (
      <>
        <ChatClientCopy />
        {/* <ChatClient /> */}
      </>
    );
  }

  return (
    <>
      <ChatClientCopy
        chatItem={chat.chatItem}
        chatMessages={convertToUIMessages(chat.chatMessages)}
        // preloaded={preloaded}
        // chatId={chatId}
      />
      {/* <ChatClient
        chatItem={chat.chatItem}
        chatMessages={convertToUIMessages(chat.chatMessages)}
        preloaded={preloaded}
        // chatId={chatId}
      /> */}
    </>
  );
}

// import { preloadQuery } from "convex/nextjs";
// import { api } from "@/convex/_generated/api";
// import { Tasks } from "./Tasks";

// export async function TasksWrapper() {
//   const preloadedTasks = await preloadQuery(api.tasks.list, {
//     list: "default",
//   });
//   return <Tasks preloadedTasks={preloadedTasks} />;
// }
