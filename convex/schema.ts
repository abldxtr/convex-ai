import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

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
    .index("by_chatId_userId_id", ["chatId", "userId", "id"])
    .searchIndex("search_body", {
      searchField: "content",
      filterFields: ["userId"],
    }),
  searchItem: defineTable({
    id: v.string(),
    userId: v.id("users"),
    title: v.string(),
    content: v.string(),
    searchText: v.string(),
  }).index("by_userId", ["userId"]),

  stream: defineTable({
    id: v.string(),
    chatId: v.id("chats"),
    userId: v.id("users"),
  }).index("by_chatId", ["chatId"]),
  documents: defineTable({
    embedding: v.array(v.float64()),
    text: v.string(),
    metadata: v.object({
      id: v.string(),
    }),
  }).vectorIndex("byEmbedding", {
    vectorField: "embedding",
    dimensions: 1536,
  }),
});

export default schema;
