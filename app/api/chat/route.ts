import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { openrouter } from "@openrouter/ai-sdk-provider";
import {
  appendClientMessage,
  createDataStream,
  smoothStream,
  streamText,
  type UIMessage,
  type Message,
} from "ai";
import { generateUUID } from "@/lib/utils";
import {
  PostRequestBodyExtended,
  postRequestBodySchema,
  type PostRequestBody,
} from "./schema";
import {
  createResumableStreamContext,
  type ResumableStreamContext,
} from "resumable-stream";
import { after, NextResponse } from "next/server";
// import { generateTitleFromUserMessage } from "@/app/(main)/actions";
import { fetchMutation, fetchQuery, fetchAction } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { redirect } from "next/navigation";
import { Id } from "@/convex/_generated/dataModel";
import { mmd } from "@/provider/providers";
import { useAction } from "convex/react";
import { revalidatePath } from "next/cache";

function convertToUIMessage(message: any): UIMessage {
  const text = message.content ?? message.parts?.text ?? "";

  return {
    id: message.id ?? generateUUID(),
    role: message.role,
    content: text,
    parts: [
      {
        type: "text",
        text,
      },
    ],
  };
}

export const maxDuration = 60;

let globalStreamContext: ResumableStreamContext | null = null;

function getStreamContext() {
  if (!globalStreamContext) {
    try {
      globalStreamContext = createResumableStreamContext({
        waitUntil: after,
      });
    } catch (error: any) {
      if (error.message.includes("REDIS_URL")) {
        // console.log(
        //   " > Resumable streams are disabled due to missing REDIS_URL"
        // );
      } else {
        console.error(error);
      }
    }
  }

  return globalStreamContext;
}

export async function POST(req: Request) {
  // const json: PostRequestBody = await req.json();
  const body = await req.json();
  // // console.log({ body: JSON.stringify(body, null, 2) });

  const token = await convexAuthNextjsToken();
  const userId = await fetchQuery(api.user.getUser, {}, { token });
  if (!userId) {
    return NextResponse.json({ error: "User not found" }, { status: 401 });
  }
  // // console.log({ json: JSON.stringify(body, null, 2) });
  // // console.log("body.chatId", body.chatId);
  const getChat = await fetchQuery(
    api.chat.getChatById,
    {
      id: body.chatId,
    },
    { token }
  );
  // // console.log("get chat", getChat);
  if (!getChat?.chatItem) {
    // const chatId = await fetchMutation(
    //   api.chat.createChatMutation,
    //   {
    //     title: body.message.content,
    //     id: body.chatId,
    //     userId: userId._id,
    //     isDeleted: false,
    //   },
    //   { token }
    // );

    const chatId = await fetchAction(api.agent.createThread, {
      prompt: body.message.content,
      id: body.chatId,
      userId: userId._id,
      isDeleted: false,
    });
    if (chatId === null) {
      return NextResponse.json({ error: "Chat not found" }, { status: 401 });
    }
    // // console.log("chatId", chatId);

    const saveMessage = await fetchMutation(
      api.vercel.createVercelAiMessage,
      {
        chatId: chatId.chatId,
        id: body.message.id || crypto.randomUUID(),
        content: body.message.content,
        role: "user",
        parts: [{ type: "text", text: body.message.content }],
        userId: userId._id,
      },
      { token }
    );
    const getPreviousMessages = await fetchQuery(
      api.vercel.getVercelAiMessages,
      { chatId: chatId.chatId },
      { token }
    );

    const messages: Omit<Message, "id">[] =
      getPreviousMessages && getPreviousMessages.length > 0
        ? getPreviousMessages.map((msg) => ({
            createdAt: new Date(msg.createdAt),
            role: msg.role,
            content: msg.content,
            parts: msg.parts,
          }))
        : [
            {
              createdAt: new Date(body.message.createdAt),
              role: body.message.role,
              content: body.message.content,
              parts: body.message.parts,
            },
          ];

    // // console.log({ messages: JSON.stringify(messages, null, 2) });

    const allMessages = appendClientMessage({
      // @ts-expect-error: todo add type conversion from DBMessage[] to UIMessage[]
      messages: messages,
      message: body.message,
    });
    // // console.log("all message if ", allMessages);

    // // console.log({ allMessages: JSON.stringify(allMessages, null, 2) });
    const result = streamText({
      model: mmd.languageModel(
        body.model ?? "meta-llama/llama-3.2-3b-instruct:free"
      ),
      // model: openrouter.chat("qwen/qwen-2.5-7b-instruct:free"),
      // model: openrouter.chat("meta-llama/llama-3.2-3b-instruct:free"),

      // prompt: "hello my dear, my name is bahar, who are you",
      messages: allMessages,
      system:
        "You are a helpful assistant that can answer questions and help with tasks. the output must be in markdown format.",

      experimental_transform: smoothStream({
        delayInMs: 20, // optional: defaults to 10ms
        chunking: "word", // optional: defaults to 'word'
      }),
      onFinish: async (result) => {
        // // console.log({ result });
        // // console.log("eeeeee", result.response.messages);
        // // console.log({
        //   json: JSON.stringify(result.response.messages, null, 2),
        // });
        const a = await fetchMutation(
          api.vercel.createVercelAiMessage,
          {
            chatId: chatId.chatId,
            id: crypto.randomUUID(),
            userId: userId._id,
            content: result.text,
            role: "assistant",
            parts: [{ type: "text", text: result.text }],
          },
          { token }
        );
        revalidatePath("/(main)/chat/[chatId]", "layout");

        //   const createChat = useMutation(api.chat.createChat);

        // redirect(`/chat/${b}`);
      },
    });

    return result.toDataStreamResponse();
  } else {
    const saveMessage = await fetchMutation(
      api.vercel.createVercelAiMessage,
      {
        chatId: getChat.chatItem._id,
        userId: userId._id,
        id: body.message.id || crypto.randomUUID(),

        content: body.message.content,
        role: "user",
        parts: [{ type: "text", text: body.message.content }],
      },
      { token }
    );
    const getPreviousMessages = await fetchQuery(
      api.vercel.getVercelAiMessages,
      { chatId: getChat.chatItem._id },
      { token }
    );

    const messages: Omit<Message, "id">[] =
      getPreviousMessages && getPreviousMessages.length > 0
        ? getPreviousMessages.map((msg) => ({
            createdAt: new Date(msg.createdAt),
            role: msg.role,
            content: msg.content,
            parts: msg.parts,
          }))
        : [
            {
              createdAt: new Date(body.message.createdAt),
              role: body.message.role,
              content: body.message.content,
              parts: body.message.parts,
            },
          ];

    // // console.log({ messages: JSON.stringify(messages, null, 2) });

    const allMessages = appendClientMessage({
      // @ts-expect-error: todo add type conversion from DBMessage[] to UIMessage[]
      messages: messages,
      message: body.message,
    });

    // // console.log("all message else ", allMessages);

    // // console.log({ allMessages: JSON.stringify(allMessages, null, 2) });
    const result = streamText({
      model: mmd.languageModel(
        body.model ?? "meta-llama/llama-3.2-3b-instruct:free"
      ),
      // prompt: "hello my dear, my name is bahar, who are you",
      messages: allMessages,
      system:
        "You are a helpful assistant that can answer questions and help with tasks. the output must be in markdown format.",

      experimental_transform: smoothStream({
        delayInMs: 20, // optional: defaults to 10ms
        chunking: "word", // optional: defaults to 'word'
      }),
      onFinish: async (result) => {
        // // console.log({ result });
        // // console.log("eeeeee", result.response.messages);
        // // console.log({
        //   json: JSON.stringify(result.response.messages, null, 2),
        // });
        const a = await fetchMutation(
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

        revalidatePath("/(main)/chat/[chatId]", "layout");
        //   const createChat = useMutation(api.chat.createChat);

        // redirect(`/chat/${b}`);
      },
    });

    return result.toDataStreamResponse();
  }
  // return result.toUIMessageStreamResponse();
}

// export async function POST(req: Request) {
//   const { messages, img_url } = await req.json();

//   const result = streamText({
//     model: openrouter.chat("opengvlab/internvl3-14b:free"),
//     messages: [
//       {
//         role: "user",
//         content: [
//           {
//             type: "image",
//             image: new URL(
//               "https://www.famousbirthdays.com/faces/jean-elsa-image.jpg",
//             ),
//           },
//         ],
//       },
//     ],
//     experimental_transform: smoothStream({
//       delayInMs: 30, // optional: defaults to 10ms
//       chunking: "word", // optional: defaults to 'word'
//     }),
//     onFinish: (result) => {
//       // console.log(result);
//     },
//   });

//   return result.toDataStreamResponse();
// }

// IMG model: "opengvlab/internvl3-14b:free",
// TEXT model: "meta-llama/llama-3.2-3b-instruct:free"

// const result = streamText({
//   model: openrouter.chat("opengvlab/internvl3-14b:free"),
//   messages: [
//     {
//       role: "user",
//       content: [
//         {
//           type: "image",
//           image: new URL(
//             "https://www.famousbirthdays.com/faces/jean-elsa-image.jpg",
//           ),
//         },
//       ],
//     },
//   ],
//   experimental_transform: smoothStream({
//     delayInMs: 30, // optional: defaults to 10ms
//     chunking: "word", // optional: defaults to 'word'
//   }),
//   onFinish: (result) => {
//     // console.log(result);
//   },
// });

// // console.log({ user });
// const requestBody = postRequestBodySchema.parse(json);

// // console.log({ messages, text });

// const title = await generateTitleFromUserMessage({
//   message: json.message as UIMessage,
// });
// // console.log({ title });
// const allMessages: UIMessage[] = [
//   ...previousMessagesArray.map(convertToUIMessage),
//   convertToUIMessage(json.messages),
// ];
// const safeMessages = allMessages.filter(
//   (msg) =>
//     msg.role && ["user", "assistant", "system", "function"].includes(msg.role)
// );
// // console.log({ allMessages });
// const messages = appendClientMessage({
//   // @ts-expect-error: todo add type conversion from DBMessage[] to UIMessage[]
//   messages: previousMessagesArray,
//   message: json.messages,
// });

// const previousMessagesArray = messages
// .map((message) => ({
//   role: message.role,
//   content: message.parts,
//   parts: message.parts,
//   createdAt: message.createdAt,
// }))
// .flat();
