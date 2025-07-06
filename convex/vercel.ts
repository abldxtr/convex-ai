import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const createVercelAiMessage = mutation({
  args: {
    chatId: v.id("chats"),
    id: v.string(),
    content: v.string(),
    role: v.union(v.literal("user"), v.literal("assistant")),
    userId: v.id("users"),
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
    const isHasMessage = await ctx.db
      .query("vercelAiMessages")
      .withIndex("by_ID", (q) => q.eq("id", args.id))
      .first();

    if (isHasMessage) {
      return null;
    }

    const messages = await ctx.db.insert("vercelAiMessages", {
      chatId: args.chatId,
      id: args.id,
      userId: args.userId,
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

export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

export const getStorageUrl = query({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
});
