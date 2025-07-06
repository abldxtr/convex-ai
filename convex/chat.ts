import { v } from "convex/values";
import { paginationOptsValidator, type PaginationResult } from "convex/server";
import {
  internalAction,
  internalMutation,
  mutation,
  query,
} from "./_generated/server";
import { createTool } from "@convex-dev/agent";
import { components, internal } from "./_generated/api";
import { openai } from "@ai-sdk/openai";
import type { MessageDoc, ThreadDoc } from "@convex-dev/agent";
import { z } from "zod";
import { getAuthUserId } from "@convex-dev/auth/server";

import { Doc, Id } from "./_generated/dataModel";

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

export const createChatMutation = mutation({
  args: {
    title: v.string(),
    userId: v.id("users"),
    id: v.string(),
    isDeleted: v.boolean(),
  },
  handler: async (ctx, args): Promise<Id<"chats">> => {
    // const streamId = await streamingComponent.createStream(ctx);

    // const userId = await getAuthUserId(ctx);
    // if (userId === null) {
    //   return null;
    // }
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

export const createChat = mutation({
  args: {
    title: v.string(),
    userId: v.id("users"),
    id: v.string(),
    isDeleted: v.boolean(),
    visibility: v.optional(v.union(v.literal("public"), v.literal("private"))),
  },
  handler: async (ctx, args): Promise<Id<"chats">> => {
    // const streamId = await streamingComponent.createStream(ctx);
    const chatId = await ctx.db.insert("chats", {
      id: args.id,
      title: args.title,
      userId: args.userId,
      isDeleted: args.isDeleted,
      visibility: args.visibility ?? "private",
      // stream: streamId,
    });
    return chatId as Id<"chats">;
  },
});

export const changeChatVisibility = mutation({
  args: {
    userId: v.id("users"),
    chatId: v.id("chats"),
    visibility: v.optional(v.union(v.literal("public"), v.literal("private"))),
  },
  handler: async (ctx, args): Promise<Id<"chats"> | null> => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      return null;
    }
    // const chatOwn = await ctx.db.query("chats").withIndex("by_userId",)
    const chat = await ctx.db.get(args.chatId);

    if (chat === null) {
      // throw new Error("Chat not found.");
      return null;
    }

    // Ensure the authenticated user owns the chat they are trying to modify
    if (chat.userId !== userId) {
      // You might want to throw an error for unauthorized modification
      // throw new Error(
      //   "You do not have permission to change this chat's visibility."
      // );
      return null;
    }

    await ctx.db.patch(args.chatId, {
      visibility: args.visibility,
    });
    return args.chatId;
  },
});

export const updateChatTitle = internalMutation({
  args: {
    title: v.string(),
    chatId: v.id("chats"),
  },
  handler: async (ctx, args) => {
    if (!args.chatId) {
      return null;
    }
    // سنجش اینکه چت به این کاربر تعلق داره یا نه
    await ctx.db.patch(args.chatId, {
      title: args.title,
    });
    return "done!";
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
  handler: async (
    ctx,
    args
  ): Promise<{
    chatItem: Doc<"chats">;
    chatMessages: Doc<"vercelAiMessages">[];
  } | null> => {
    // return await ctx.db.get(args.chatId);
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      return null;
    }
    // داک مربوط به append رو بخون برای useChat vercel ai sdk
    const chatItem = await ctx.db
      .query("chats")
      .withIndex("by_createId", (q) => q.eq("id", args.id))
      .unique();
    if (chatItem) {
      const chatMessages = await ctx.db
        .query("vercelAiMessages")
        .withIndex("by_chatId", (q) => q.eq("chatId", chatItem._id))
        .collect();

      return { chatItem, chatMessages };
    }

    return null;
  },
});

export const getChatByUserId = query({
  args: { chatId: v.string() },
  handler: async (ctx, args): Promise<boolean> => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return false;
    }

    const chat = await ctx.db
      .query("chats")
      .withIndex("by_userId_createId", (q) =>
        q.eq("id", args.chatId).eq("userId", userId)
      )
      .first();

    if (chat) {
      return true;
    }

    return false;
  },
});

export const deleteChat = mutation({
  args: { id: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      return null;
    }

    const chat = await ctx.db
      .query("chats")
      .withIndex("by_createId", (q) => q.eq("id", args.id))
      .unique();
    if (chat) {
      const isUserChat = chat.userId === userId;
      if (isUserChat) {
        return await ctx.db.delete(chat._id);
      }
      return null;
    }
    return null;
  },
});

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

    return "updated";
  },
});

export const getThreads = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (
    ctx,
    { paginationOpts }
  ): Promise<PaginationResult<ThreadDoc> | { page: [] }> => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      return { page: [] };
    }

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

export const saveMessageWithInternal = internalMutation({
  args: {
    content: v.string(),
    role: v.union(v.literal("user"), v.literal("assistant")),
    threadId: v.string(),
  },
  handler: async (ctx, args): Promise<string> => {
    // const messageId = await ctx.db.insert("conversation", args);
    return "success";
  },
});

export const saveMessageWithInternalAction = internalAction({
  args: {
    content: v.string(),
    role: v.union(v.literal("user"), v.literal("assistant")),
    threadId: v.string(),
  },
  handler: async (ctx, args): Promise<string> => {
    return await ctx.runMutation(internal.chat.saveMessageWithInternal, args);
  },
});
