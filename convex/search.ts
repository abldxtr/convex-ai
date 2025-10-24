import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const setSearchHistory = mutation({
  args: {
    id: v.string(),
    title: v.string(),
    content: v.string(),
    searchText: v.string(),
  },
  handler: async (ctx, { id, title, content, searchText }) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      return null;
    }

    const existingItem = await ctx.db
      .query("searchItem")
      .withIndex("by_chat_id", (q) => q.eq("id", id))
      .filter((q) => q.eq(q.field("searchText"), searchText))
      .first();
    console.log(existingItem);
    if (existingItem !== null) {
      return null;
    }

    return await ctx.db.insert("searchItem", {
      id,
      title,
      userId,
      content,
      searchText,
    });
  },
});

export const getSearchHistory = query({
  args: {},
  handler: async (ctx, {}) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      return null;
    }

    return await ctx.db
      .query("searchItem")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .take(5);
  },
});
