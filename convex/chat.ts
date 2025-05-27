import { v } from "convex/values";
import { paginationOptsValidator, type PaginationResult } from "convex/server";
import {
  action,
  httpAction,
  internalAction,
  internalMutation,
  mutation,
  query,
} from "./_generated/server";
import { Agent, createTool } from "@convex-dev/agent";
import { components, internal } from "./_generated/api";
// import { getAuthUserId } from "@convex-dev/auth/server";
import { openai } from "@ai-sdk/openai";
import type { MessageDoc, ThreadDoc } from "@convex-dev/agent";
import { z } from "zod";
import { getAuthUserId } from "@convex-dev/auth/server";
import { supportAgent } from "./agent";
import {
  PersistentTextStreaming,
  StreamIdValidator,
  type StreamId,
} from "@convex-dev/persistent-text-streaming";
import { streamingComponent } from "./streaming";
import { Id } from "./_generated/dataModel";

export const getThreadMessages = query({
  args: { threadId: v.string() },
  handler: async (ctx, { threadId }) => {
    return await ctx.runQuery(
      components.agent.messages.listMessagesByThreadId,
      {
        threadId,
      }
    );
  },
});

// export const getStreamId = query({
//   args: { threadId: v.string() },
//   handler: async (ctx, { threadId }) => {
//     return await ctx.runQuery(components.persistentTextStreaming.lib.getStreamText,{
//       streamId:""
//     });
//   },
// });

export const createChat = internalMutation({
  args: {
    title: v.string(),
    userId: v.id("users"),
    id: v.string(),
    isDeleted: v.boolean(),
  },
  handler: async (ctx, args): Promise<Id<"chats">> => {
    // const streamId = await streamingComponent.createStream(ctx);
    const chatId = await ctx.db.insert("chats", {
      id: args.id,
      title: args.title,
      userId: args.userId,
      isDeleted: args.isDeleted,
      // stream: streamId,
    });
    return chatId as Id<"chats">;
  },
});

export const createChatMutation = mutation({
  args: {
    title: v.string(),
    userId: v.id("users"),
    id: v.string(),
    isDeleted: v.boolean(),
  },
  handler: async (ctx, args): Promise<Id<"chats">> => {
    // const streamId = await streamingComponent.createStream(ctx);
    const chatId = await ctx.db.insert("chats", {
      id: args.id,
      title: args.title,
      userId: args.userId,
      isDeleted: args.isDeleted,
      // stream: streamId,
    });
    return chatId as Id<"chats">;
  },
});

export const getChat = query({
  args: {},
  handler: async (ctx, args) => {
    // return await ctx.db.get(args.chatId);
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      return null;
    }
    const chatList = await ctx.db
      .query("chats")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();
    if (chatList.length === 0 || chatList === undefined) {
      return null;
    }

    return chatList;
  },
});

export const getChatById = query({
  args: { id: v.string() },
  handler: async (ctx, args) => {
    // return await ctx.db.get(args.chatId);
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      return null;
    }
    const chatItem = await ctx.db
      .query("chats")
      .withIndex("by_createId", (q) => q.eq("id", args.id))
      .unique();
    if (chatItem) {
      return chatItem;
    }

    return null;
  },
});

// Create a query that returns the chat body.
export const getChatBody = query({
  args: {
    streamId: StreamIdValidator,
  },
  handler: async (ctx, args) => {
    return await streamingComponent.getStreamBody(
      ctx,
      args.streamId as StreamId
    );
  },
});

// Create an HTTP action that generates chunks of the chat body
// and uses the component to stream them to the client and save them to the database.
// export const streamChat = httpAction(async (ctx, request) => {
//   const body = (await request.json()) as { streamId: string };
//   // const generateChat = async (ctx, request, streamId, chunkAppender) => {
//   //   await chunkAppender("Hi there!");
//   //   await chunkAppender("How are you?");
//   //   await chunkAppender("Pretend I'm an AI or something!");
//   //   await chunkAppender("Hi tssshere!");
//   //   await chunkAppender("Pretend I'm an AI or something!");
//   // };

//   // const response = await streamingComponent.stream(
//   //   ctx,
//   //   request,
//   //   body.streamId as StreamId,
//   //   // generateChat
//   // );

//   // Set CORS headers appropriately.
//   // response.headers.set("Access-Control-Allow-Origin", "*");
//   // response.headers.set("Vary", "Origin");
//   // return response;
//   return null
// });

export const updateThreadTitle = createTool({
  args: z.object({
    title: z.string().describe("The new title for the thread"),
  }),
  description:
    "Update the title of the current thread. It will respond with 'updated' if it succeeded",
  handler: async (ctx, args) => {
    if (!ctx.threadId) {
      console.warn("updateThreadTitle called without a threadId");
      return "skipped";
    }
    // await ctx.runMutation(components.agent.messages.updateThread, {
    //   threadId: ctx.threadId,
    //   patch: { title: args.title },
    // });
    return "updated";
  },
});

export const getThreads = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (
    ctx,
    { paginationOpts }
  ): Promise<PaginationResult<ThreadDoc> | { page: [] }> => {
    // const userId = await getAuthUserId(ctx);
    // if (!userId) throw new Error("Not authenticated");
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      //   throw new Error("Client is not authenticated!");
      return { page: [] };
    }
    // const results = await ctx.runQuery(
    //   components.agent.messages.listMessagesByThreadId,
    //   { userId, paginationOpts }
    // );
    // return results;
    // return { page: [] };
    return { page: [] };
  },
});

export const getMessages = query({
  args: { threadId: v.string(), paginationOpts: paginationOptsValidator },
  handler: async (ctx, { threadId, paginationOpts }) => {
    return await ctx.runQuery(
      components.agent.messages.listMessagesByThreadId,
      {
        threadId,
        paginationOpts,
      }
    );
  },
});

export const getInProgressMessages = query({
  args: { threadId: v.string() },
  handler: async (ctx, { threadId }): Promise<MessageDoc[]> => {
    const results = await ctx.runQuery(
      components.agent.messages.listMessagesByThreadId,
      {
        threadId,
        paginationOpts: { numItems: 10, cursor: null },
        statuses: ["pending"],
      }
    );
    return results.page;
  },
});

// export const startWorkFlowMutation = action({
//   args: { prompt: v.string(), threadId: v.optional(v.string()) },
//   handler: async (ctx, args): Promise<string> => {
//     return await ctx.runMutation(internal.exam.startWorkflow, args);
//   },
// });

// export const saveMessage = mutation({
//   args: {
//     content: v.string(),
//     role: v.union(v.literal("user"), v.literal("assistant")),
//     threadId: v.string(),
//   },
//   handler: async (ctx, args) => {
//     return await ctx.db.insert("conversation", args);
//   },
// });

// export const saveMessageWithInternal = internalMutation({
//   args: {
//     content: v.string(),
//     role: v.union(v.literal("user"), v.literal("assistant")),
//     threadId: v.string(),
//   },
//   handler: async (ctx, args): Promise<string> => {
//     const messageId = await ctx.db.insert("conversation", args);
//     return "success";
//   },
// });

// export const saveMessageWithInternalAction = internalAction({
//   args: {
//     content: v.string(),
//     role: v.union(v.literal("user"), v.literal("assistant")),
//     threadId: v.string(),
//   },
//   handler: async (ctx, args): Promise<string> => {
//     return await ctx.runMutation(internal.chat.saveMessageWithInternal, args);
//   },
// });

// export const getMessagesByThreadId = query({
//   args: { threadId: v.string() },
//   handler: async (ctx, args) => {
//     console.log("getMessagesByThreadId", args.threadId);

//     const allMessages = await ctx.db
//       .query("conversation")
//       .withIndex("by_threadId", (q) => q.eq("threadId", args.threadId))
//       .collect();
//     if (allMessages.length === 0 || allMessages === undefined) {
//       return [];
//     }
//     return allMessages;
//   },
// });
