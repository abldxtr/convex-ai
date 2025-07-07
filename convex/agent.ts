import { createOpenAI } from "@ai-sdk/openai";
import { Agent } from "@convex-dev/agent";
import { components, internal } from "./_generated/api";
import { v } from "convex/values";
import {
  action,
  httpAction,
  internalAction,
  internalMutation,
  internalQuery,
} from "./_generated/server";

export const openai = createOpenAI({
  compatibility: "strict",
  apiKey: process.env.OPENAI_API_KEY,
  // baseURL: "https://api.chatanywhere.tech/v1",
  // baseURL: "https://api.chatanywhere.tech/v1",
  baseURL: "https://api.sambanova.ai/v1",
});

const openAiChina = createOpenAI({
  compatibility: "strict",
  // apiKey: process.env.OPENAI_API_KEY_CHINA,
  // baseURL: "https://api.chatanywhere.org/v1",

  apiKey: process.env.OPENAI_API_AVAL,
  baseURL: " https://api.avalai.ir/v1",
});
// Define an agent similarly to the AI SDK
export const supportAgent = new Agent(components.agent, {
  // chat: openrouter.chat("gemini-1.5-flash"),
  // chat: openai.chat("DeepSeek-V3-0324"),
  chat: openAiChina.chat("gpt-4o"),

  // textEmbedding: openai.textEmbedding("text-embedding-3-small"),
  instructions: `\n
  - what the language of the user is, you must respond in the same language
    - you will generate a short title based on the first message a user begins a conversation with
    - ensure it is not more than 30 characters long
    - the title should be a summary of the user's message
    - do not use quotes or colons
    `,
  usageHandler: async (ctx, args) => {
    // console.log({ args });
  },
});

export const createThread = action({
  args: {
    prompt: v.string(),
    chatId: v.id("chats"),
  },
  handler: async (ctx, args) => {
    const { threadId, thread } = await supportAgent.createThread(ctx);
    try {
      const result = await thread.generateText({ prompt: args.prompt });
      if (result.text) {
        await ctx.runMutation(internal.chat.updateChatTitle, {
          title: result.text,
          chatId: args.chatId,
        });
        return "done!";
      }
    } catch {
      await ctx.runMutation(internal.chat.updateChatTitle, {
        title: args.prompt.slice(0, 22),
        chatId: args.chatId,
      });
    }
  },
});

// Pick up where you left off, with the same or a different agent:
export const continueThread = internalAction({
  args: { prompt: v.string(), threadId: v.string() },
  handler: async (ctx, { prompt, threadId }) => {
    // Continue a thread, picking up where you left off.suppr

    const { thread } = await supportAgent.continueThread(ctx, { threadId });
    // This includes previous message history from the thread automatically.
    const result = await thread.generateText({ prompt });
    const saveToDb = await ctx.runMutation(
      internal.chat.saveMessageWithInternal,
      {
        content: result.text,
        role: "assistant",
        threadId,
      }
    );
    return result.text;
  },
});

export const getThreadMessages = internalQuery({
  args: { threadId: v.string() },
  handler: async (ctx, { threadId }) => {
    const messages = await ctx.runQuery(
      components.agent.messages.listMessagesByThreadId,
      { threadId }
    );
    return messages;
  },
});
export const sendMessageHttpStream = httpAction(async (ctx, request) => {
  const { prompt, threadId } = await request.json();

  if (!threadId) {
    const { thread } = await supportAgent.createThread(ctx);
    const result = await thread.generateText({ prompt });
    return new Response(result.text);
  }

  const { thread } = await supportAgent.continueThread(ctx, {
    threadId,
  });

  // Save user message first
  await ctx.scheduler.runAfter(0, internal.agent.saveMessageToDb, {
    content: prompt,
    role: "user",
    threadId,
  });

  // Stream the response
  const result = await thread.streamText({ prompt });
  const fullText = await result.text;

  // Save assistant message after completion
  await ctx.runMutation(internal.agent.saveMessageToDb, {
    content: fullText,
    role: "assistant",
    threadId,
  });

  // Return the full response
  const response = new Response(fullText, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Message-Id": result.messageId,
    },
  });

  return response;
});

export const saveMessageDbAction = action({
  args: {
    content: v.string(),
    role: v.union(v.literal("user"), v.literal("assistant")),
    threadId: v.string(),
  },
  handler: async (ctx, { content, role, threadId }) => {
    await ctx.runMutation(internal.chat.saveMessageWithInternal, {
      content,
      role,
      threadId,
    });
  },
});

export const saveMessageToDb = internalMutation({
  args: {
    content: v.string(),
    role: v.union(v.literal("user"), v.literal("assistant")),
    threadId: v.string(),
  },
  handler: async (ctx, { content, role, threadId }) => {
    await ctx.runMutation(internal.chat.saveMessageWithInternal, {
      content,
      role,
      threadId,
    });
  },
});
