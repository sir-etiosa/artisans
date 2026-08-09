import { pgTable, text, integer, timestamp, uuid, jsonb } from "drizzle-orm/pg-core";
import { users } from "./users";

// One row per Paystack deposit attempt. amountKobo is NGN in the subunit
// Paystack expects. "awaiting_credit" = payment confirmed by Paystack, sitting
// for tx-admin approval before ART actually moves — see project notes on why
// that manual step exists (fraud/tax review, same shape as identity review).
export const deposits = pgTable("deposits", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  reference: text("reference").notNull().unique(),
  amountKobo: integer("amount_kobo").notNull(),
  status: text("status").notNull().default("pending"), // "pending" | "awaiting_credit" | "credited" | "failed"
  paystackData: jsonb("paystack_data"),
  creditedBy: uuid("credited_by").references(() => users.id),
  creditedAt: timestamp("credited_at", { withTimezone: true }),
  artTxHash: text("art_tx_hash"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
