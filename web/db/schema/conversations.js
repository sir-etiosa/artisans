import { pgTable, timestamp, uuid } from "drizzle-orm/pg-core";
import { users } from "./users";

// One row per pair of users. userAId is always the smaller-sorted UUID of
// the two, so a (userA, userB) pair only ever has one conversation — see
// lib/messaging/get-or-create-conversation.js for the lookup/insert logic.
export const conversations = pgTable("conversations", {
  id: uuid("id").primaryKey().defaultRandom(),
  userAId: uuid("user_a_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  userBId: uuid("user_b_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
