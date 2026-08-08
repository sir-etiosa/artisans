import { pgTable, text, timestamp, uuid, boolean, jsonb } from "drizzle-orm/pg-core";

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
  // AES-256-GCM ciphertext (iv+authTag+ciphertext, base64) — never sent to
  // the client. See lib/wallet/crypto.js.
  walletPrivateKeyEnc: text("wallet_private_key_enc"),
  // Cleanverse on-chain verification (A-Pass), Monad-only for now — see
  // lib/cleanverse/. "not_connected" until real sandbox credentials exist.
  verificationStatus: text("verification_status").notNull().default("not_connected"),
  verificationCheckedAt: timestamp("verification_checked_at", { withTimezone: true }),
  verificationRaw: jsonb("verification_raw"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
