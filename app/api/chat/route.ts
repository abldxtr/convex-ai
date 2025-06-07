import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
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
  createResumableStreamContext,
  type ResumableStreamContext,
} from "resumable-stream";
import { after, NextResponse } from "next/server";
import { fetchMutation, fetchQuery, fetchAction } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { mmd } from "@/provider/providers";
import { createOpenAI } from "@ai-sdk/openai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
const google = createGoogleGenerativeAI({
  // custom settings
  apiKey: process.env.GOOGLE_API_KEY,
});

const openai = createOpenAI({
  // custom settings, e.g.
  compatibility: "strict", // strict mode, enable when using the OpenAI API
  apiKey: process.env.OPENAI_API_KEY,
});

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
  const body = await req.json();
  // // console.log({ body: JSON.stringify(body, null, 2) });
  console.log("body.model", body.model);
  const token = await convexAuthNextjsToken();
  const userId = await fetchQuery(api.user.getUser, {}, { token });
  if (!userId) {
    return NextResponse.json({ error: "User not found" }, { status: 401 });
  }
  const getChat = await fetchQuery(
    api.chat.getChatById,
    {
      id: body.chatId,
    },
    { token }
  );
  // // console.log("get chat", getChat);
  if (!getChat?.chatItem) {
    const chatId = await fetchAction(api.agent.createThread, {
      prompt: body.message.content,
      id: body.chatId,
      userId: userId._id,
      isDeleted: false,
    });
    if (chatId === null) {
      return NextResponse.json({ error: "Chat not found" }, { status: 401 });
    }

    await fetchMutation(
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

    const allMessages = appendClientMessage({
      // @ts-expect-error: todo add type conversion from DBMessage[] to UIMessage[]
      messages: messages,
      message: body.message,
    });

    const result = streamText({
      model: mmd.languageModel(
        body.model ?? "meta-llama/llama-3.2-3b-instruct:free"
      ),
      // model: openai("o3-mini"),
      // model: google("gemini-1.5-flash"),
      // model: openrouter.chat("qwen/qwen-2.5-7b-instruct:free"),
      // model: openrouter.chat("meta-llama/llama-3.2-3b-instruct:free"),

      // prompt: "hello my dear, my name is bahar, who are you",
      messages: allMessages,
      system:
        "You are a helpful assistant that can answer questions and help with tasks. the output must be in markdown format.",

      experimental_transform: smoothStream({
        delayInMs: 20,
        chunking: "word",
      }),
      onFinish: async (result) => {
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

    const allMessages = appendClientMessage({
      // @ts-expect-error: todo add type conversion from DBMessage[] to UIMessage[]
      messages: messages,
      message: body.message,
    });

    const result = streamText({
      model: mmd.languageModel(
        body.model ?? "mmd-meta-llama/llama-3.3-8b-instruct:free"
      ),
      // model: openai("o3-mini"),
      // model: google("gemini-1.5-flash"),
      messages: allMessages,
      system:
        "You are a helpful assistant that can answer questions and help with tasks. the output must be in markdown format.",

      experimental_transform: smoothStream({
        delayInMs: 20,
        chunking: "word",
      }),
      onFinish: async (result) => {
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
      },
    });

    return result.toDataStreamResponse();
  }
  // return result.toUIMessageStreamResponse();
}
