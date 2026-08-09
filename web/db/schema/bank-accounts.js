import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { users } from "./users";

// One linked payout account per user. accountName is what Paystack's
// resolve-account call returned, never hand-typed — see
// app/api/bank-accounts/route.js for why.
export const bankAccounts = pgTable("bank_accounts", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().unique().references(() => users.id, { onDelete: "cascade" }),
  bankCode: text("bank_code").notNull(),
  bankName: text("bank_name").notNull(),
  accountNumber: text("account_number").notNull(),
  accountName: text("account_name").notNull(),
  paystackRecipientCode: text("paystack_recipient_code"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
