import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

// The schema is normally optional, but Convex Auth
// requires indexes defined on `authTables`.
// The schema provides more precise TypeScript types.
export default defineSchema({
  ...authTables,
  people: defineTable({
    email: v.string(),
    name: v.optional(v.string()),
    poem1: v.union(v.boolean(), v.number()), // maybe within 10 minutes?
    poem2: v.union(v.boolean(), v.number()), // within 10 hours?
    poem3: v.union(v.boolean(), v.number()), // within 24 hours?
    poem4: v.union(v.boolean(), v.number()), // within 2 days?
    response: v.optional(v.string()),
    shared: v.optional(v.boolean())
  })
});
