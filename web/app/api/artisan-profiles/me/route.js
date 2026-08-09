import { NextResponse } from "next/server";
import { z } from "zod";
import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import { artisanProfiles } from "@/db/schema";
import { getSession } from "@/lib/auth/session";

const activeOwnProfile = (userId) => and(eq(artisanProfiles.userId, userId), isNull(artisanProfiles.deletedAt));

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const profile = await db.query.artisanProfiles.findFirst({ where: activeOwnProfile(session.userId) });
  return NextResponse.json({ profile: profile || null });
}

const updateSchema = z.object({
  trade: z.string().trim().min(2, "Trade is required").optional(),
  tagline: z.string().trim().max(120).optional(),
  area: z.string().trim().max(120).optional(),
  bio: z.string().trim().max(1000).optional(),
  yearsExperience: z.coerce.number().int().min(0).max(60).optional(),
  rate: z.string().trim().max(60).optional(),
  lat: z.coerce.number().min(-90).max(90).optional(),
  lng: z.coerce.number().min(-180).max(180).optional(),
});

export async function PATCH(request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const existing = await db.query.artisanProfiles.findFirst({ where: activeOwnProfile(session.userId) });
  if (!existing) return NextResponse.json({ error: "No profile to update" }, { status: 404 });

  const parsed = updateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid profile details" }, { status: 400 });
  }

  const [profile] = await db.update(artisanProfiles).set(parsed.data).where(eq(artisanProfiles.id, existing.id)).returning();
  return NextResponse.json({ profile });
}

export async function DELETE() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const existing = await db.query.artisanProfiles.findFirst({ where: activeOwnProfile(session.userId) });
  if (!existing) return NextResponse.json({ error: "No profile to delete" }, { status: 404 });

  // Soft delete — bookings reference artisanProfileId, and past jobs/reviews
  // shouldn't vanish just because the seller closed their listing.
  await db.update(artisanProfiles).set({ deletedAt: new Date() }).where(eq(artisanProfiles.id, existing.id));
  return NextResponse.json({ ok: true });
}
