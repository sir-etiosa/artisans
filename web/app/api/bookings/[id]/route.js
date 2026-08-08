import { NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { bookings, artisanProfiles } from "@/db/schema";
import { getSession } from "@/lib/auth/session";

const updateSchema = z.object({ status: z.enum(["accepted", "declined", "completed", "cancelled"]) });

export async function PATCH(request, { params }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const { id } = await params;
  const parsed = updateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid status" }, { status: 400 });

  const booking = await db.query.bookings.findFirst({ where: eq(bookings.id, id) });
  if (!booking) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { status } = parsed.data;

  if (status === "accepted" || status === "declined") {
    const artisanProfile = await db.query.artisanProfiles.findFirst({ where: eq(artisanProfiles.id, booking.artisanProfileId) });
    if (!artisanProfile || artisanProfile.userId !== session.userId) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }
    if (booking.status !== "pending") return NextResponse.json({ error: "Already responded to" }, { status: 400 });
  }

  if (status === "completed" || status === "cancelled") {
    if (booking.customerId !== session.userId) return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    if (status === "completed" && booking.status !== "accepted") {
      return NextResponse.json({ error: "Job hasn't been accepted yet" }, { status: 400 });
    }
  }

  const [updated] = await db
    .update(bookings)
    .set({
      status,
      respondedAt: status === "accepted" || status === "declined" ? new Date() : booking.respondedAt,
      completedAt: status === "completed" ? new Date() : booking.completedAt,
    })
    .where(eq(bookings.id, id))
    .returning();

  return NextResponse.json({ booking: updated });
}
