import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getPixelsInRegion = query({
  args: {
    startX: v.number(),
    startY: v.number(),
    endX: v.number(),
    endY: v.number(),
  },
  handler: async (ctx, args) => {
    const pixels = await ctx.db
      .query("pixels")
      .withIndex("by_position", (q) =>
        q.gte("x", args.startX).lte("x", args.endX)
      )
      .filter((q) => q.gte(q.field("y"), args.startY))
      .filter((q) => q.lte(q.field("y"), args.endY))
      .collect();
    
    return pixels;
  },
});

export const setPixel = mutation({
  args: {
    x: v.number(),
    y: v.number(),
    color: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in to set pixels");
    }

    // Check bounds
    if (args.x < 0 || args.x >= 1000 || args.y < 0 || args.y >= 1000) {
      throw new Error("Pixel coordinates out of bounds");
    }

    // Check if pixel already exists
    const existingPixel = await ctx.db
      .query("pixels")
      .withIndex("by_position", (q) => q.eq("x", args.x).eq("y", args.y))
      .unique();

    if (existingPixel) {
      // Update existing pixel
      await ctx.db.patch(existingPixel._id, {
        color: args.color,
        userId,
      });
    } else {
      // Create new pixel
      await ctx.db.insert("pixels", {
        x: args.x,
        y: args.y,
        color: args.color,
        userId,
      });
    }
  },
});
