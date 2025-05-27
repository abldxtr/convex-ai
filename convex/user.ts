import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getUser = query({
  args: {
    /* ... */
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    // const userId = await ctx.auth.getUserIdentity();
    console.log("userid serversdideeeeeeeee");
    console.log({ userId });
    if (userId === null) {
      return null;
    }

    // const user = await ctx.db.get(userId);

    // return user;
    return userId;
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
