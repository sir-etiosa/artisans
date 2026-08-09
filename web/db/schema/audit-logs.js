import { pgTable, text, timestamp, uuid, jsonb, bigserial } from "drizzle-orm/pg-core";

// Append-only, hash-chained audit trail. `seq` is the true ordering key
// (a timestamp can't be trusted for that); `hash` = sha256(prevHash + this
// row's canonical fields), so editing or deleting any row breaks every
// hash after it — detectable via lib/audit/verify-chain.js. A DB-level
// trigger (see db/migrations/audit-log-immutable.sql) additionally blocks
// UPDATE/DELETE on this table outright, so the app layer isn't the only
// thing standing between this data and tampering.
export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  seq: bigserial("seq", { mode: "number" }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  actorUserId: uuid("actor_user_id"),
  actorEmail: text("actor_email"),
  eventType: text("event_type").notNull(),
  targetType: text("target_type"),
  targetId: text("target_id"),
  metadata: jsonb("metadata").default({}),
  prevHash: text("prev_hash").notNull(),
  hash: text("hash").notNull(),
});
