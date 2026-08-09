import { NextResponse } from "next/server";
import { z } from "zod";
import { eq, or, desc } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { db } from "@/db";
import { bookings, artisanProfiles, users } from "@/db/schema";
import { getSession } from "@/lib/auth/session";
import { escrowFromUser, getArtBalance, isArtTokenConfigured, nairaToArt } from "@/lib/art/send-art";
import { logAuditEvent } from "@/lib/audit/log-event";

const createSchema = z.object({
  artisanId: z.string().uuid(),
  jobDescription: z.string().trim().min(2, "Describe the job"),
  address: z.string().trim().max(300).optional(),
  scheduledDate: z.string().trim().max(40).optional(),
  scheduledTime: z.string().trim().max(20).optional(),
  amount: z.string().trim().max(60).optional(),
  amountNaira: z.coerce.number().int().positive("Enter the agreed price"),
});

export async function POST(request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const parsed = createSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid booking details" }, { status: 400 });
  }

  const artisanProfile = await db.query.artisanProfiles.findFirst({ where: eq(artisanProfiles.userId, parsed.data.artisanId) });
  if (!artisanProfile) return NextResponse.json({ error: "Artisan not found" }, { status: 404 });
  if (artisanProfile.userId === session.userId) {
    return NextResponse.json({ error: "You can't book yourself" }, { status: 400 });
  }

  const customer = await db.query.users.findFirst({ where: eq(users.id, session.userId) });
  if (!customer || customer.verificationStatus !== "verified") {
    return NextResponse.json({ error: "Verify your identity before booking" }, { status: 403 });
  }
  if (!isArtTokenConfigured()) {
    return NextResponse.json({ error: "ART isn't wired up yet — can't hold escrow" }, { status: 503 });
  }

  const amountArt = nairaToArt(parsed.data.amountNaira);
  const balance = await getArtBalance(customer.walletAddress);
  if (balance == null || balance < amountArt) {
    return NextResponse.json({ error: `Not enough ART — you have ${balance ?? 0}, need ${amountArt}. Deposit more first.` }, { status: 400 });
  }

  // Real ART moves to escrow (the operator wallet) before the booking ever
  // exists — no booking row without funds genuinely locked up first.
  const escrowResult = await escrowFromUser({ fromAddress: customer.walletAddress, amountArt });
  if (!escrowResult.ok) return NextResponse.json({ error: escrowResult.error }, { status: 502 });

  const { artisanId, ...rest } = parsed.data;
  const [booking] = await db
    .insert(bookings)
    .values({ customerId: session.userId, artisanProfileId: artisanProfile.id, ...rest, escrowTxHash: escrowResult.txHash })
    .returning();

  await logAuditEvent({
    actorUserId: session.userId, eventType: "booking_escrowed", targetType: "booking", targetId: booking.id,
    metadata: { amountNaira: parsed.data.amountNaira, amountArt, escrowTxHash: escrowResult.txHash },
  });

  return NextResponse.json({ booking });
}

// Bookings where the signed-in user is either the customer, or (if they have
// an artisan profile) the artisan — the dashboard's request queue reads from here.
export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const ownProfile = await db.query.artisanProfiles.findFirst({ where: eq(artisanProfiles.userId, session.userId) });
  const artisanUser = alias(users, "artisan_user");

  const rows = await db
    .select({
      id: bookings.id,
      customerId: bookings.customerId,
      customerName: users.fullName,
      artisanProfileId: bookings.artisanProfileId,
      artisanUserId: artisanUser.id,
      artisanName: artisanUser.fullName,
      jobDescription: bookings.jobDescription,
      address: bookings.address,
      scheduledDate: bookings.scheduledDate,
      scheduledTime: bookings.scheduledTime,
      amount: bookings.amount,
      amountNaira: bookings.amountNaira,
      platformFeeNaira: bookings.platformFeeNaira,
      payoutNaira: bookings.payoutNaira,
      escrowTxHash: bookings.escrowTxHash,
      releaseTxHash: bookings.releaseTxHash,
      status: bookings.status,
      createdAt: bookings.createdAt,
    })
    .from(bookings)
    .innerJoin(users, eq(users.id, bookings.customerId))
    .innerJoin(artisanProfiles, eq(artisanProfiles.id, bookings.artisanProfileId))
    .innerJoin(artisanUser, eq(artisanUser.id, artisanProfiles.userId))
    .where(
      ownProfile
        ? or(eq(bookings.customerId, session.userId), eq(bookings.artisanProfileId, ownProfile.id))
        : eq(bookings.customerId, session.userId)
    )
    .orderBy(desc(bookings.createdAt));

  return NextResponse.json({ bookings: rows, ownArtisanProfileId: ownProfile?.id || null });
}
