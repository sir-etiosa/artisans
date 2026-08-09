import { NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { bookings, artisanProfiles, users } from "@/db/schema";
import { requireAdmin } from "@/lib/auth/require-admin";
import { computeBookingFee } from "@/lib/booking/fee";
import { sendArtToUser, nairaToArt } from "@/lib/art/send-art";
import { logAuditEvent } from "@/lib/audit/log-event";

// Manual dispute resolution for a booking stuck in escrow — neither side
// confirmed "done", or one side is disputing the other. A tx-admin decides
// how the escrowed ART splits: `release` sends the artisan the full amount
// (minus the standard 20% fee), `refund` sends the customer everything
// back, `split` lets the admin pick any point between the two — that's the
// "penalty to either party" lever: set artisanShareNaira low to penalize a
// no-show artisan, or high to penalize a customer who's stonewalling
// confirmation despite the job being done.
const resolveSchema = z.object({
  decision: z.enum(["release", "refund", "split"]),
  artisanShareNaira: z.coerce.number().int().min(0).optional(),
});

export async function POST(request, { params }) {
  const guard = await requireAdmin(["tx"]);
  if (guard.error) return NextResponse.json({ error: guard.error }, { status: guard.status });

  const { id } = await params;
  const parsed = resolveSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid input" }, { status: 400 });

  const booking = await db.query.bookings.findFirst({ where: eq(bookings.id, id) });
  if (!booking) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!["pending", "accepted"].includes(booking.status)) {
    return NextResponse.json({ error: "This booking isn't holding escrow anymore" }, { status: 400 });
  }
  if (booking.amountNaira == null || !booking.escrowTxHash) {
    return NextResponse.json({ error: "No real escrow on this booking to resolve" }, { status: 400 });
  }

  const { decision } = parsed.data;
  const artisanShareNaira =
    decision === "release" ? booking.amountNaira :
    decision === "refund" ? 0 :
    parsed.data.artisanShareNaira;

  if (artisanShareNaira == null || artisanShareNaira < 0 || artisanShareNaira > booking.amountNaira) {
    return NextResponse.json({ error: "artisanShareNaira must be between 0 and the escrowed amount" }, { status: 400 });
  }

  const fee = computeBookingFee(artisanShareNaira);
  const refundNaira = booking.amountNaira - artisanShareNaira;

  const artisanProfile = await db.query.artisanProfiles.findFirst({ where: eq(artisanProfiles.id, booking.artisanProfileId) });
  const artisanUser = await db.query.users.findFirst({ where: eq(users.id, artisanProfile.userId) });
  const customer = await db.query.users.findFirst({ where: eq(users.id, booking.customerId) });

  let artisanTxHash = null;
  let customerTxHash = null;

  if (fee.payoutNaira > 0) {
    const result = await sendArtToUser({ toAddress: artisanUser?.walletAddress, amountArt: nairaToArt(fee.payoutNaira) });
    if (!result.ok) return NextResponse.json({ error: `Couldn't pay artisan: ${result.error}` }, { status: 502 });
    artisanTxHash = result.txHash;
  }
  if (refundNaira > 0) {
    const result = await sendArtToUser({ toAddress: customer?.walletAddress, amountArt: nairaToArt(refundNaira) });
    if (!result.ok) return NextResponse.json({ error: `Couldn't refund customer: ${result.error}` }, { status: 502 });
    customerTxHash = result.txHash;
  }

  const [updated] = await db
    .update(bookings)
    .set({
      status: artisanShareNaira === 0 ? "cancelled" : "completed",
      completedAt: new Date(),
      platformFeeNaira: fee.platformFeeNaira,
      payoutNaira: fee.payoutNaira,
      releaseTxHash: artisanTxHash || customerTxHash,
      resolvedBy: guard.user.id,
    })
    .where(eq(bookings.id, id))
    .returning();

  await logAuditEvent({
    actorUserId: guard.user.id, actorEmail: guard.user.email,
    eventType: "booking_resolved_by_admin", targetType: "booking", targetId: id,
    metadata: { decision, amountNaira: booking.amountNaira, artisanShareNaira, refundNaira, ...fee, artisanTxHash, customerTxHash },
  });

  return NextResponse.json({ booking: updated });
}
