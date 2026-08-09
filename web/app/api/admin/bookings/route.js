import { NextResponse } from "next/server";
import { and, desc, eq, inArray, isNotNull } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { db } from "@/db";
import { bookings, artisanProfiles, users } from "@/db/schema";
import { requireAdmin } from "@/lib/auth/require-admin";

// Bookings currently holding real escrow — pending or accepted, with a real
// on-chain escrow transfer behind them. What a tx-admin resolves disputes from.
export async function GET() {
  const guard = await requireAdmin(["tx"]);
  if (guard.error) return NextResponse.json({ error: guard.error }, { status: guard.status });

  const artisanUser = alias(users, "artisan_user");

  const rows = await db
    .select({
      id: bookings.id,
      customerName: users.fullName,
      artisanName: artisanUser.fullName,
      jobDescription: bookings.jobDescription,
      scheduledDate: bookings.scheduledDate,
      scheduledTime: bookings.scheduledTime,
      amountNaira: bookings.amountNaira,
      escrowTxHash: bookings.escrowTxHash,
      status: bookings.status,
      createdAt: bookings.createdAt,
    })
    .from(bookings)
    .innerJoin(users, eq(users.id, bookings.customerId))
    .innerJoin(artisanProfiles, eq(artisanProfiles.id, bookings.artisanProfileId))
    .innerJoin(artisanUser, eq(artisanUser.id, artisanProfiles.userId))
    .where(and(inArray(bookings.status, ["pending", "accepted"]), isNotNull(bookings.escrowTxHash)))
    .orderBy(desc(bookings.createdAt));

  return NextResponse.json({ bookings: rows });
}
