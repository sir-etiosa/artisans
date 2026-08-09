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
  // the client. See lib/crypto/secret.js.
  walletPrivateKeyEnc: text("wallet_private_key_enc"),
  // Internal admin role — gates /admin routes. "support" (identity review),
  // "tx" (deposit/treasury review), "full" (both). Null = not an admin. No
  // self-serve UI to grant this; set directly in the DB for now.
  adminRole: text("admin_role"),
  // Cleanverse on-chain verification (A-Pass), Monad-only for now — see
  // lib/cleanverse/. "not_connected" until real sandbox credentials exist.
  verificationStatus: text("verification_status").notNull().default("not_connected"),
  verificationCheckedAt: timestamp("verification_checked_at", { withTimezone: true }),
  verificationRaw: jsonb("verification_raw"),
  // SHA-256 of (issuingCountryISO2 + idType + idNumber), unique — Cleanverse's
  // API doesn't stop the same document from registering under a second
  // wallet/account, so we enforce one-account-per-document ourselves.
  verificationIdHash: text("verification_id_hash").unique(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
