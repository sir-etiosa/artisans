import { NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { bookings, artisanProfiles, users } from "@/db/schema";
import { getSession } from "@/lib/auth/session";
import { logAuditEvent } from "@/lib/audit/log-event";
import { computeBookingFee } from "@/lib/booking/fee";
import { sendArtToUser, nairaToArt } from "@/lib/art/send-art";

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
  const artisanProfile = await db.query.artisanProfiles.findFirst({ where: eq(artisanProfiles.id, booking.artisanProfileId) });

  if (status === "accepted" || status === "declined") {
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

  // Escrow only ever holds real ART if amountNaira was set (i.e. this
  // booking went through the real escrow flow) — older test/edge-case rows
  // without it just transition status with no fund movement.
  const hasRealEscrow = booking.amountNaira != null && booking.escrowTxHash;
  let releaseTxHash = null;
  let fee = null;

  if (hasRealEscrow && status === "completed") {
    const artisanUser = await db.query.users.findFirst({ where: eq(users.id, artisanProfile.userId) });
    fee = computeBookingFee(booking.amountNaira);
    const result = await sendArtToUser({ toAddress: artisanUser?.walletAddress, amountArt: nairaToArt(fee.payoutNaira) });
    if (!result.ok) return NextResponse.json({ error: `Couldn't release escrow: ${result.error}` }, { status: 502 });
    releaseTxHash = result.txHash;
  }

  if (hasRealEscrow && (status === "declined" || status === "cancelled")) {
    // Job never happened — full refund, no fee charged.
    const customer = await db.query.users.findFirst({ where: eq(users.id, booking.customerId) });
    const result = await sendArtToUser({ toAddress: customer?.walletAddress, amountArt: nairaToArt(booking.amountNaira) });
    if (!result.ok) return NextResponse.json({ error: `Couldn't refund escrow: ${result.error}` }, { status: 502 });
    releaseTxHash = result.txHash;
  }

  const [updated] = await db
    .update(bookings)
    .set({
      status,
      respondedAt: status === "accepted" || status === "declined" ? new Date() : booking.respondedAt,
      completedAt: status === "completed" ? new Date() : booking.completedAt,
      ...(fee && { platformFeeNaira: fee.platformFeeNaira, payoutNaira: fee.payoutNaira }),
      ...(releaseTxHash && { releaseTxHash }),
    })
    .where(eq(bookings.id, id))
    .returning();

  await logAuditEvent({
    actorUserId: session.userId, eventType: "booking_status_changed", targetType: "booking", targetId: id,
    metadata: { from: booking.status, to: status, ...(fee && { amountNaira: booking.amountNaira, ...fee }), ...(releaseTxHash && { releaseTxHash }) },
  });

  return NextResponse.json({ booking: updated });
}
