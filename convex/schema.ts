import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";
// import { StreamIdValidator } from "@convex-dev/persistent-text-streaming";
// "user" | "data" | "system" | "assistant"

const schema = defineSchema({
  ...authTables,

  chats: defineTable({
    id: v.string(),
    title: v.string(),
    userId: v.string(),
    isDeleted: v.boolean(),
  }).index("by_userId", ["userId"]),

  vercelAiMessages: defineTable({
    chatId: v.string(),
    content: v.string(),
    role: v.union(
      v.literal("system"),
      v.literal("user"),
      v.literal("assistant"),
      v.literal("data")
    ),
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
    createdAt: v.number(),
  }).index("by_chatId", ["chatId"]),
});

export default schema;

// name: string;
// url: string;
// contentType: "image/png" | "image/jpg" | "image/jpeg";
