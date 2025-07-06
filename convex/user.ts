import { v } from "convex/values";
import { query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getUser = query({
  args: {},
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    const userId_other = await ctx.auth.getUserIdentity();

    if (userId === null) {
      return null;
    }
    const user = await ctx.db
      .query("users")
      .withIndex("by_id", (q) => q.eq("_id", userId))
      .unique();

    return user;
  },
});

export const getUserById = query({
  args: {
    id: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    const { id } = args;
    if (id) {
      const user = await ctx.db.get(id);

      return user;
    } else {
      return null;
    }
  },
});
