import { fetchQuery } from "convex/nextjs";
import ChatClient from "../chat-client";
import { api } from "@/convex/_generated/api";
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { redirect } from "next/navigation";
import { Attachment, UIMessage } from "ai";
import { ChatMessage } from "@/lib/type";
import exa from "@/lib/exa";

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
      content: "",
      createdAt: new Date(message.createdAt),
      experimental_attachments: message.attachments
        ? [message.attachments as Attachment]
        : [],
    }));
  }
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
  // console.log({ chat });

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
