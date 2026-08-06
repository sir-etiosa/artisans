import { pgTable, text, timestamp, uuid, boolean } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull().default("customer"), // "customer" | "artisan"
  emailVerified: boolean("email_verified").notNull().default(false),
  walletAddress: text("wallet_address"),
  walletChain: text("wallet_chain"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
