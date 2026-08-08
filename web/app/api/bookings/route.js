import { NextResponse } from "next/server";
import { z } from "zod";
import { eq, or, desc } from "drizzle-orm";
import { db } from "@/db";
import { bookings, artisanProfiles, users } from "@/db/schema";
import { getSession } from "@/lib/auth/session";

const createSchema = z.object({
  artisanId: z.string().uuid(),
  jobDescription: z.string().trim().min(2, "Describe the job"),
  address: z.string().trim().max(300).optional(),
  scheduledDate: z.string().trim().max(40).optional(),
  scheduledTime: z.string().trim().max(20).optional(),
  amount: z.string().trim().max(60).optional(),
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

  const { artisanId, ...rest } = parsed.data;
  const [booking] = await db
    .insert(bookings)
    .values({ customerId: session.userId, artisanProfileId: artisanProfile.id, ...rest })
    .returning();

  return NextResponse.json({ booking });
}

// Bookings where the signed-in user is either the customer, or (if they have
// an artisan profile) the artisan — the dashboard's request queue reads from here.
export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const ownProfile = await db.query.artisanProfiles.findFirst({ where: eq(artisanProfiles.userId, session.userId) });

  const rows = await db
    .select({
      id: bookings.id,
      customerId: bookings.customerId,
      customerName: users.fullName,
      artisanProfileId: bookings.artisanProfileId,
      jobDescription: bookings.jobDescription,
      address: bookings.address,
      scheduledDate: bookings.scheduledDate,
      scheduledTime: bookings.scheduledTime,
      amount: bookings.amount,
      status: bookings.status,
      createdAt: bookings.createdAt,
    })
    .from(bookings)
    .innerJoin(users, eq(users.id, bookings.customerId))
    .where(
      ownProfile
        ? or(eq(bookings.customerId, session.userId), eq(bookings.artisanProfileId, ownProfile.id))
        : eq(bookings.customerId, session.userId)
    )
    .orderBy(desc(bookings.createdAt));

  return NextResponse.json({ bookings: rows, ownArtisanProfileId: ownProfile?.id || null });
}
