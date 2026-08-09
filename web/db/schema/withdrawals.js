import { pgTable, text, real, integer, timestamp, uuid } from "drizzle-orm/pg-core";
import { users } from "./users";
import { bankAccounts } from "./bank-accounts";

// artAmount is what leaves the user's balance (sent back to treasury —
// see lib/art/send-art.js, currently a stub same as the deposit-credit
// side). amountKobo is the NGN payout at the fixed rate, paid via a real
// Paystack Transfer (test-mode transfers succeed automatically).
export const withdrawals = pgTable("withdrawals", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  bankAccountId: uuid("bank_account_id").notNull().references(() => bankAccounts.id),
  artAmount: real("art_amount").notNull(),
  amountKobo: integer("amount_kobo").notNull(),
  status: text("status").notNull().default("pending"), // "pending" | "approved" | "paid" | "failed"
  reviewedBy: uuid("reviewed_by").references(() => users.id),
  reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
  paystackTransferCode: text("paystack_transfer_code"),
  paystackTransferRef: text("paystack_transfer_ref"),
  artReturnTxHash: text("art_return_tx_hash"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
