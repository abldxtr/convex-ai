import { tool } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import { Agent, createTool } from "@convex-dev/agent";
import { components, internal } from "./_generated/api";
import { v } from "convex/values";
import {
  action,
  httpAction,
  internalAction,
  internalMutation,
  internalQuery,
  mutation,
  query,
} from "./_generated/server";
import { createOpenRouter, openrouter } from "@openrouter/ai-sdk-provider";
import { getAuthUserId } from "@convex-dev/auth/server";
import {
  PersistentTextStreaming,
  StreamIdValidator,
  type StreamId,
} from "@convex-dev/persistent-text-streaming";
import { Id } from "./_generated/dataModel";

const persistentTextStreaming = new PersistentTextStreaming(
  components.persistentTextStreaming
);

// Define an agent similarly to the AI SDK
export const supportAgent = new Agent(components.agent, {
  chat: openrouter.chat("meta-llama/llama-3.2-3b-instruct:free"),
  // textEmbedding: openai.textEmbedding("text-embedding-3-small"),
  instructions: `\n
    - you will generate a short title based on the first message a user begins a conversation with
    - ensure it is not more than 32 characters long
    - the title should be a summary of the user's message
    - do not use quotes or colons
    - what the language of the user is, you must respond in the same language
    `,
  usageHandler: async (ctx, args) => {
    // console.log({ args });
  },
});

export const createThread = action({
  args: {
    prompt: v.string(),
    // userId: v.id("users"),
    // id: v.string(),
    chatId: v.id("chats"),
    // isDeleted: v.boolean(),
  },
  handler: async (ctx, args) => {
    // Start a new thread for the user.
    // const userId = await getAuthUserId(ctx);
    // if (userId === null) {
    //   return null;
    // }
    // console.log("createThread");
    const { threadId, thread } = await supportAgent.createThread(ctx);
    // Creates a user message with the prompt, and an assistant reply message.
    const result = await thread.generateText({ prompt: args.prompt });
    if (result.text) {
      await ctx.runMutation(internal.chat.updateChatTitle, {
        title: result.text,
        chatId: args.chatId,
      });
      return "done!";
    }
    await ctx.runMutation(internal.chat.updateChatTitle, {
      title: args.prompt.slice(0, 22),
      chatId: args.chatId,
    });
  },
});

// const createChatMutation = mutation({
//   args: {
//     title: v.string(),
//     userId: v.string(),
//     id: v.string(),
//     isDeleted: v.boolean(),
//   },
//   handler: async (ctx, args) => {
//     const result = await
//     await ctx.runMutation(internal.chat.createChat, {
//       title: args.title,
//       userId: args.userId,
//       id: args.id,
//       isDeleted: args.isDeleted,
//     });
//   },
// });
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

  // console.log("convex Httpppppppppppppp");
  // console.log({ threadId });

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

// export const getMessagesByThreadId = query({
//   args: { threadId: v.string() },
//   handler: async (ctx, { threadId }) => {
//     const messages = await ctx.db
//       .query("conversation")
//       .filter((q) => q.eq(q.field("threadId"), threadId))
//       .collect();

//     // const threadDoc = await ctx.runMutation(
//     //   components.agent.messages.createThread,
//     //   {
//     //     userId: "123",
//     //     title: "test",
//     //     summary: "test",
//     //   },
//     // );
//     return messages;
//   },
// });
