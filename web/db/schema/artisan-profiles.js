import { pgTable, text, integer, real, jsonb, timestamp, uuid } from "drizzle-orm/pg-core";
import { users } from "./users";

// One row per artisan account — kept separate from `users` since most
// accounts (customers) never need this data. Portfolio/reviews are
// deliberately absent for now; that's the profile-redesign work.
export const artisanProfiles = pgTable("artisan_profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  // Not DB-unique on purpose — soft-deleting (deletedAt) and re-creating
  // must be possible, so "one active profile per user" is enforced in the
  // API instead (see app/api/artisan-profiles/route.js).
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
  trade: text("trade").notNull(),
  tagline: text("tagline"),
  area: text("area"),
  // Real coordinates from the browser Geolocation API, captured when the
  // artisan sets up their profile — used for haversine distance search, not
  // just the free-text `area` label.
  lat: real("lat"),
  lng: real("lng"),
  bio: text("bio"),
  yearsExperience: integer("years_experience").default(1),
  rate: text("rate"),
  trustScore: integer("trust_score").default(80),
  rating: real("rating").default(4.5),
  jobsCompleted: integer("jobs_completed").default(0),
  responseMinutes: integer("response_minutes").default(15),
  repeatClientPct: integer("repeat_client_pct").default(20),
  certs: jsonb("certs").default([]),
  breakdown: jsonb("breakdown").default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
