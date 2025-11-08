import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  pixels: defineTable({
    x: v.number(),
    y: v.number(),
    color: v.string(),
    userId: v.id("users"),
  }).index("by_position", ["x", "y"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
