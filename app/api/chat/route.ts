import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import {
  appendClientMessage,
  smoothStream,
  streamText,
  type Attachment,
} from "ai";
import { generateUUID } from "@/lib/utils";
import {
  createResumableStreamContext,
  type ResumableStreamContext,
} from "resumable-stream";
import { after, NextResponse } from "next/server";
import { fetchMutation, fetchQuery, fetchAction } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { mmd } from "@/provider/providers";
import { base64ToBlob } from "@/lib/base64-to-blob";
import { Doc, Id } from "@/convex/_generated/dataModel";

const DEFAULT_MODEL = "meta-llama/llama-3.2-3b-instruct:free";
const DEFAULT_IMAGE_MODEL = "mmd-google/gemini-2.0-flash-exp:free";
const SYSTEM_PROMPT = `
  - You are a helpful assistant that can answer questions and help with tasks. The output must be in markdown format. 📝
  - Respond in the same language as the user. 🌍
  
  [For Coding Requests] 💻
  - If the user specifically asks to create code:
    * Generate only JavaScript code using React.js with Next.js (App Router, version 15) and only use Tailwind CSS for Styling
    * Provide complete, ready-to-use code without explanations
    * Include all necessary components for seamless Next.js App Router integration
    * Format example: 
      \`\`\`javascript
      // Complete React/Next.js code here
      \`\`\`

  [For Non-Coding Questions] 📚
  - For questions about history, art, science, etc.:
    * Provide clear, detailed textual explanations
    * Use friendly tone with relevant emojis/icons
    * Structure information logically
    * Example format:
      "The Renaissance period (14th-17th century) 🎨 was..."

  - Always make responses engaging with appropriate visuals ✨
`;

function convertToUIMessage(message: any) {
  const text = message.content ?? message.parts?.[0]?.text ?? "";
  return {
    id: message.id ?? generateUUID(),
    role: message.role,
    content: text,
    parts: [{ type: "text", text }],
  };
}

export const maxDuration = 60;

let globalStreamContext: ResumableStreamContext | null = null;

function getStreamContext() {
  if (!globalStreamContext) {
    try {
      globalStreamContext = createResumableStreamContext({ waitUntil: after });
    } catch (error: any) {
      if (!error.message.includes("REDIS_URL")) {
        console.error(error);
      }
    }
  }
  return globalStreamContext;
}

async function handleAttachment(
  attachment: Attachment,
  body: any,
  userId: Doc<"users">,
  token: string,
  chatId: Id<"chats">
) {
  const serverUrl = await fetchMutation(api.vercel.generateUploadUrl);
  const blb = base64ToBlob(attachment.url);
  const result = await fetch(serverUrl, {
    method: "POST",
    headers: { "Content-Type": attachment.contentType! },
    body: blb,
  });
  const { storageId } = await result.json();
  const storageUrl = await fetchQuery(api.vercel.getStorageUrl, { storageId });

  if (!storageUrl) {
    return NextResponse.json(
      { error: "Storage URL not found" },
      { status: 500 }
    );
  }

  await fetchMutation(
    api.vercel.createVercelAiMessage,
    {
      chatId,
      id: body.message.id || crypto.randomUUID(),
      content: body.message.content,
      role: "user",
      parts: [{ type: "text", text: body.message.content }],
      userId: userId._id,
      attachments: {
        contentType: attachment?.contentType as
          | "image/png"
          | "image/jpg"
          | "image/jpeg",
        name: attachment.name!,
        url: storageUrl,
      },
    },
    { token }
  );

  return storageUrl;
}

type GetPreviousMessages = {
  _id: Id<"vercelAiMessages">;
  _creationTime: number;
  parts?: { text: string; type: string }[] | undefined;
  attachments?: {
    url: string;
    name: string;
    contentType: "image/png" | "image/jpg" | "image/jpeg";
  };
  role: "user" | "system" | "assistant" | "data";
  content: string;
  id: string;
  userId: Id<"users">;
  chatId: Id<"chats">;
  createdAt: number;
};

async function getPreviousMessages(
  chatId: Id<"chats">,
  token: string,
  body: any
) {
  const getPreviousMessages = await fetchQuery(
    api.vercel.getVercelAiMessages,
    { chatId },
    { token }
  );

  return getPreviousMessages && getPreviousMessages.length > 0
    ? getPreviousMessages.map((msg: GetPreviousMessages) => ({
        id: msg.id,
        createdAt: new Date(msg.createdAt),
        role: msg.role,
        content: msg.content,
        parts: msg.parts?.map((part) => ({ type: "text", text: part.text })),
      }))
    : [
        {
          id: generateUUID(),
          createdAt: new Date(body.message.createdAt),
          role: body.message.role as "system" | "user" | "assistant" | "data",
          content: body.message.content as string,
          parts: body.message.parts?.map((part: any) => ({
            type: "text",
            text: part.text,
          })),
        },
      ];
}

export async function POST(req: Request) {
  const body = await req.json();
  const token = await convexAuthNextjsToken();
  if (!token) {
    return NextResponse.json({ error: "User not found" }, { status: 401 });
  }
  const userId = await fetchQuery(api.user.getUser, {}, { token });

  if (!userId) {
    return NextResponse.json({ error: "User not found" }, { status: 401 });
  }

  const getChat = await fetchQuery(
    api.chat.getChatById,
    { id: body.chatId },
    { token }
  );

  if (!getChat?.chatItem) {
    const chatId = await fetchMutation(api.chat.createChat, {
      id: body.chatId,
      isDeleted: false,
      title: "",
      userId: userId._id,
    });

    if (
      body.message.experimental_attachments &&
      body.message.experimental_attachments.length > 0
    ) {
      const attachment = body.message.experimental_attachments[0];
      const storageUrl = await handleAttachment(
        attachment,
        body,
        userId,
        token,
        chatId
      );

      const result = streamText({
        model: mmd.languageModel(body.model ?? DEFAULT_IMAGE_MODEL),

        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: body.message.content as string },
              { type: "image", image: storageUrl as string },
            ],
          },
        ],
        system: SYSTEM_PROMPT,
        onFinish: async (result) => {
          await fetchAction(api.agent.createThread, {
            prompt: body.message.content,
            chatId,
          });
          await fetchMutation(
            api.vercel.createVercelAiMessage,
            {
              chatId,
              id: crypto.randomUUID(),
              userId: userId._id,
              content: result.text,
              role: "assistant",
              parts: [{ type: "text", text: result.text }],
            },
            { token }
          );
          // revalidateTag("user_chat_own");
          // revalidateTag("user");
        },
        onError: async (e) => {
          await fetchAction(api.agent.createThread, {
            prompt: body.message.content,
            chatId,
          });
          // revalidateTag("user_chat_own");
          // revalidateTag("user");
          console.log(e);
        },
      });

      return result.toDataStreamResponse();
    }

    await fetchMutation(
      api.vercel.createVercelAiMessage,
      {
        chatId,
        id: body.message.id || crypto.randomUUID(),
        content: body.message.content,
        role: "user",
        parts: [{ type: "text", text: body.message.content }],
        userId: userId._id,
      },
      { token }
    );

    const messages = await getPreviousMessages(
      chatId as Id<"chats">,
      token,
      body
    );
    const allMessages = appendClientMessage({
      messages,
      message: body.message,
    });

    const result = streamText({
      model: mmd.languageModel(body.model ?? DEFAULT_MODEL),
      messages: allMessages,
      system: SYSTEM_PROMPT,
      experimental_transform: smoothStream({ delayInMs: 20, chunking: "word" }),
      onFinish: async (result) => {
        await fetchAction(api.agent.createThread, {
          prompt: body.message.content,
          chatId,
        });
        await fetchMutation(
          api.vercel.createVercelAiMessage,
          {
            chatId,
            id: crypto.randomUUID(),
            userId: userId._id,
            content: result.text,
            role: "assistant",
            parts: [{ type: "text", text: result.text }],
          },
          { token }
        );
      },
      onError: async (e) => {
        await fetchAction(api.agent.createThread, {
          prompt: body.message.content,
          chatId,
        });
      },
    });

    return result.toDataStreamResponse();
  } else {
    if (
      body.message.experimental_attachments &&
      body.message.experimental_attachments.length > 0
    ) {
      const attachment = body.message.experimental_attachments[0];
      const storageUrl = await handleAttachment(
        attachment,
        body,
        userId,
        token,
        getChat.chatItem._id
      );

      const result = streamText({
        model: mmd.languageModel(body.model ?? DEFAULT_IMAGE_MODEL),

        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: body.message.content as string },
              { type: "image", image: storageUrl as string },
            ],
          },
        ],
        system: SYSTEM_PROMPT,
        onFinish: async (result) => {
          await fetchMutation(
            api.vercel.createVercelAiMessage,
            {
              chatId: getChat.chatItem._id,
              id: crypto.randomUUID(),
              userId: userId._id,
              content: result.text,
              role: "assistant",
              parts: [{ type: "text", text: result.text }],
            },
            { token }
          );

          // revalidateTag("user_chat_own");
          // revalidateTag("user");
        },
        onError: async (e) => {
          console.log(e);
          // await fetchMutation(
          //   api.vercel.createVercelAiMessage,
          //   {
          //     chatId: getChat.chatItem._id,
          //     id: crypto.randomUUID(),
          //     userId: userId._id,
          //     content: result.text,
          //     role: "assistant",
          //     parts: [{ type: "text", text: result.text }],
          //   },
          //   { token }
          // );

          // revalidateTag("user_chat_own");
          // revalidateTag("user");
        },
      });

      return result.toDataStreamResponse();
    }

    const chatId = getChat.chatItem._id;
    await fetchMutation(
      api.vercel.createVercelAiMessage,
      {
        chatId,
        userId: userId._id,
        id: body.message.id || crypto.randomUUID(),
        content: body.message.content,
        role: "user",
        parts: [{ type: "text", text: body.message.content }],
      },
      { token }
    );

    const messages = await getPreviousMessages(chatId, token, body);
    const allMessages = appendClientMessage({
      messages,
      message: body.message,
    });

    const result = streamText({
      model: mmd.languageModel(body.model ?? DEFAULT_MODEL),

      messages: allMessages,
      system: SYSTEM_PROMPT,
      experimental_transform: smoothStream({ delayInMs: 20, chunking: "word" }),
      onFinish: async (result) => {
        await fetchMutation(
          api.vercel.createVercelAiMessage,
          {
            chatId,
            id: crypto.randomUUID(),
            userId: userId._id,
            content: result.text,
            role: "assistant",
            parts: [{ type: "text", text: result.text }],
          },
          { token }
        );

        // revalidateTag("user_chat_own");
        // revalidateTag("user");
      },
    });

    return result.toDataStreamResponse();
  }
}

// export async function GET(request: Request) {
//   const streamContext = getStreamContext();
//   const resumeRequestedAt = new Date();

//   if (!streamContext) {
//     return new Response(null, { status: 204 });
//   }

//   const { searchParams } = new URL(request.url);
//   const chatId = searchParams.get("chatId");

//   if (!chatId) {
//     return new Response("id is required", { status: 400 });
//   }

//   const token = await convexAuthNextjsToken();
//   if (!token) {
//     return NextResponse.json({ error: "User not found" }, { status: 401 });
//   }

//   const userId = await fetchQuery(api.user.getUser, {}, { token });

//   if (!userId) {
//     return new Response("Unauthorized", { status: 401 });
//   }

//   let chat: {
//     chatItem: Doc<"chats">;
//     chatMessages: Doc<"vercelAiMessages">[];
//   } | null;

//   try {
//     chat = await fetchQuery(api.chat.getChatById, { id: chatId }, { token });
//   } catch {
//     return new Response("Not found", { status: 404 });
//   }

//   if (!chat) {
//     return new Response("Not found", { status: 404 });
//   }

//   if (
//     chat.chatItem.visibility === "private" &&
//     chat.chatItem.userId !== userId._id
//   ) {
//     return new Response("Forbidden", { status: 403 });
//   }

//   let streamIds: string[] = [];

//   try {
//     streamIds = await fetchQuery(
//       api.stream.getStream,
//       { chatId },
//       { token }
//     );
//   } catch {
//     return new Response("No streams found", { status: 404 });
//   }

//   if (!streamIds.length) {
//     return new Response("No streams found", { status: 404 });
//   }

//   const recentStreamId = streamIds.at(-1);

//   if (!recentStreamId) {
//     return new Response("No recent stream found", { status: 404 });
//   }

//   const emptyDataStream = createDataStream({
//     execute: () => {},
//   });

//   const stream = await streamContext.resumableStream(
//     recentStreamId,
//     () => emptyDataStream
//   );

//   if (!stream) {
//     const messages = await getMessagesByChatId({ id: chatId });
//     const mostRecentMessage = messages.at(-1);

//     if (!mostRecentMessage) {
//       return new Response(emptyDataStream, { status: 200 });
//     }

//     if (mostRecentMessage.role !== "assistant") {
//       return new Response(emptyDataStream, { status: 200 });
//     }

//     const messageCreatedAt = new Date(mostRecentMessage.createdAt);

//     if (differenceInSeconds(resumeRequestedAt, messageCreatedAt) > 15) {
//       return new Response(emptyDataStream, { status: 200 });
//     }

//     const restoredStream = createDataStream({
//       execute: (buffer) => {
//         buffer.writeData({
//           type: "append-message",
//           message: JSON.stringify(mostRecentMessage),
//         });
//       },
//     });

//     return new Response(restoredStream, { status: 200 });
//   }

//   return new Response(stream, { status: 200 });
// }
