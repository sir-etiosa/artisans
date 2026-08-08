import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { users } from "./users";
import { artisanProfiles } from "./artisan-profiles";

// One row per booking request, created when a customer completes the escrow
// step in app/book/[id]. No real payment processor yet — "paid to escrow"
// just means a pending booking exists; artisan accept/decline and customer
// job-done both transition `status`.
export const bookings = pgTable("bookings", {
  id: uuid("id").primaryKey().defaultRandom(),
  customerId: uuid("customer_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  artisanProfileId: uuid("artisan_profile_id").notNull().references(() => artisanProfiles.id, { onDelete: "cascade" }),
  jobDescription: text("job_description").notNull(),
  address: text("address"),
  scheduledDate: text("scheduled_date"),
  scheduledTime: text("scheduled_time"),
  amount: text("amount"),
  status: text("status").notNull().default("pending"), // "pending" | "accepted" | "declined" | "completed" | "cancelled"
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  respondedAt: timestamp("responded_at", { withTimezone: true }),
  completedAt: timestamp("completed_at", { withTimezone: true }),
});
