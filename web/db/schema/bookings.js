import { pgTable, text, timestamp, uuid, integer } from "drizzle-orm/pg-core";
import { users } from "./users";
import { artisanProfiles } from "./artisan-profiles";

// One row per booking — real ART escrow now, not a simulated flow: paying
// moves real ART from the customer's wallet to the operator wallet (acting
// as escrow holder) at creation, and release/refund is a real ART transfer
// out of it, triggered either by the customer tapping "Job done"/cancel, or
// by a tx-admin resolving a stuck/disputed booking.
export const bookings = pgTable("bookings", {
  id: uuid("id").primaryKey().defaultRandom(),
  customerId: uuid("customer_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  artisanProfileId: uuid("artisan_profile_id").notNull().references(() => artisanProfiles.id, { onDelete: "cascade" }),
  jobDescription: text("job_description").notNull(),
  address: text("address"),
  scheduledDate: text("scheduled_date"),
  scheduledTime: text("scheduled_time"),
  amount: text("amount"),
  // The real number both escrow and the 20% platform fee are computed
  // from — `amount` above is just the artisan's advertised rate label.
  amountNaira: integer("amount_naira"),
  platformFeeNaira: integer("platform_fee_naira"),
  payoutNaira: integer("payout_naira"),
  escrowTxHash: text("escrow_tx_hash"),
  releaseTxHash: text("release_tx_hash"),
  // Set only when a tx-admin resolves a dispute instead of the normal
  // customer-confirms-done / declines path.
  resolvedBy: uuid("resolved_by").references(() => users.id),
  status: text("status").notNull().default("pending"), // "pending" | "accepted" | "declined" | "completed" | "cancelled"
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  respondedAt: timestamp("responded_at", { withTimezone: true }),
  completedAt: timestamp("completed_at", { withTimezone: true }),
});
