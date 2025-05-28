import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { api } from "./_generated/api";
import { getAuthUserId } from "@convex-dev/auth/server";

export const createVercelAiMessage = mutation({
  args: {
    chatId: v.id("chats"),
    id: v.string(),
    content: v.string(),
    role: v.union(v.literal("user"), v.literal("assistant")),
    parts: v.optional(
      v.array(
        v.object({
          type: v.string(),
          text: v.string(),
        })
      )
    ),
    attachments: v.optional(
      v.object({
        name: v.string(),
        url: v.string(),
        contentType: v.union(
          v.literal("image/png"),
          v.literal("image/jpg"),
          v.literal("image/jpeg")
        ),
      })
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      return null;
    }
    const messages = await ctx.db.insert("vercelAiMessages", {
      chatId: args.chatId,
      id: args.id,
      userId: userId,
      content: args.content,
      role: args.role,
      parts: args.parts,
      attachments: args.attachments,
      createdAt: Date.now(),
    });
    return messages;
  },
});

export const getVercelAiMessages = query({
  args: {
    chatId: v.id("chats"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      return null;
    }
    return await ctx.db
      .query("vercelAiMessages")
      .withIndex("by_chatId_userId", (q) =>
        q.eq("chatId", args.chatId).eq("userId", userId)
      )
      .collect();
  },
});
