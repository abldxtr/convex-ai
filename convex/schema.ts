import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";
// import { StreamIdValidator } from "@convex-dev/persistent-text-streaming";
// "user" | "data" | "system" | "assistant"
// visibility: varchar('visibility', { enum: ['public', 'private'] })

const schema = defineSchema({
  ...authTables,

  chats: defineTable({
    id: v.string(),
    title: v.string(),
    userId: v.id("users"),
    isDeleted: v.boolean(),
    visibility: v.optional(v.union(v.literal("public"), v.literal("private"))),
  })
    .index("by_userId", ["userId"])
    .index("by_createId", ["id"])
    .index("by_userId_createId", ["id", "userId"]),

  vercelAiMessages: defineTable({
    chatId: v.id("chats"),
    id: v.string(),
    userId: v.id("users"),
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
    error: v.optional(v.boolean()),
  })
    .index("by_chatId", ["chatId"])
    .index("by_userId", ["userId"])
    .index("by_chatId_userId", ["chatId", "userId"])
    .index("by_ID", ["id"])
    .index("by_chatId_userId_id", ["chatId", "userId", "id"]),
  stream: defineTable({
    id: v.string(),
    chatId: v.id("chats"),
    userId: v.id("users"),
  }).index("by_chatId", ["chatId"]),
});

export default schema;

// name: string;
// url: string;
// contentType: "image/png" | "image/jpg" | "image/jpeg";
