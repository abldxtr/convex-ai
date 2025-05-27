import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { api } from "./_generated/api";

export const createVercelAiMessage = mutation({
  args: {
    chatId: v.string(),
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
    // const existChat = await ctx.db
    //   .query("vercelAiMessages")
    //   .filter((q) => q.eq(q.field("chatId"), args.chatId))
    //   .unique();
    // if (existChat) {
    //   await ctx.db.patch(existChat._id, {
    //     content: args.content,
    //     role: args.role,
    //     parts: args.parts,
    //     attachments: args.attachments,
    //     createdAt: Date.now(),
    //   });
    //   return existChat._id;
    // }

    const messages = await ctx.db.insert("vercelAiMessages", {
      chatId: args.chatId,
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
    chatId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("vercelAiMessages")
      .filter((q) => q.eq(q.field("chatId"), args.chatId))
      .collect();
  },
});
