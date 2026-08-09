import { pgTable, text, integer, real, jsonb, timestamp, uuid } from "drizzle-orm/pg-core";
import { users } from "./users";
import { artisanProfiles } from "./artisan-profiles";

// Goods posted by artisans alongside their services — separate from
// artisan_profiles since one seller can list many items. Soft-deleted the
// same way (deletedAt), never DB-unique, filtered with isNull() everywhere.
export const goodsListings = pgTable("goods_listings", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  sellerProfileId: uuid("seller_profile_id").notNull().references(() => artisanProfiles.id, { onDelete: "cascade" }),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
  name: text("name").notNull(),
  category: text("category").notNull(),
  priceNaira: integer("price_naira").notNull(),
  // "new" or null — a "New" tag is shown only when this is "new".
  condition: text("condition"),
  description: text("description"),
  // Public Supabase Storage URLs, min 2 / max 6 — enforced in the API, not here.
  images: jsonb("images").notNull().default([]),
  // Real coordinates from the browser Geolocation API, captured at posting
  // time — same distance-search pattern as artisan_profiles.
  lat: real("lat"),
  lng: real("lng"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
