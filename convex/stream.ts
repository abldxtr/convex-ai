import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getStream = query({
  args: {
    chatId: v.id("chats"),
  },
  handler: async (ctx, args) => {
    // return await ctx.db.get(args.chatId);
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      return null;
    }
    const stream = await ctx.db
      .query("stream")
      .withIndex("by_chatId", (q) => q.eq("chatId", args.chatId))
      .collect();

    if (stream.length === 0) {
      return null;
    }
    if (stream.at(-1)?.userId !== userId) {
      return null;
    }

    return stream.at(-1);
  },
});

export const createStream = mutation({
  args: {
    chatId: v.id("chats"),
    userId: v.id("users"),
    id: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      return null;
    }
    ctx.db.insert("stream", {
      chatId: args.chatId,
      id: args.id,
      userId,
    });
  },
});
