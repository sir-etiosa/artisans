import { pgTable, text, timestamp, uuid, jsonb } from "drizzle-orm/pg-core";
import { users } from "./users";

// One row per identity submission — kept even after the user's own status
// changes, so staff have a durable audit trail. identityEnc holds the raw
// fullName/idNumber the user typed, AES-256-GCM encrypted (lib/crypto/secret.js)
// — decrypted only when a staff member opens the review detail view.
export const verificationReviews = pgTable("verification_reviews", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  idType: text("id_type").notNull(),
  issuingCountryIso2: text("issuing_country_iso2").notNull(),
  identityEnc: text("identity_enc").notNull(),
  documentHash: text("document_hash").notNull(),
  cleanverseRaw: jsonb("cleanverse_raw"),
  reviewStatus: text("review_status").notNull().default("pending"), // "pending" | "approved" | "rejected"
  reviewedBy: uuid("reviewed_by").references(() => users.id),
  reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
  reviewNote: text("review_note"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
