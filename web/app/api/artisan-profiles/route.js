import { NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { artisanProfiles, users } from "@/db/schema";
import { getSession } from "@/lib/auth/session";

const createSchema = z.object({
  trade: z.string().trim().min(2, "Trade is required"),
  tagline: z.string().trim().max(120).optional(),
  area: z.string().trim().max(120).optional(),
  bio: z.string().trim().max(1000).optional(),
  yearsExperience: z.coerce.number().int().min(0).max(60).optional(),
  rate: z.string().trim().max(60).optional(),
  lat: z.coerce.number().min(-90).max(90).optional(),
  lng: z.coerce.number().min(-180).max(180).optional(),
});

// Available to any account — role at signup ("customer" vs "artisan") is not
// a gate. The real gate is verification: you cannot create a profile without
// having actually completed the Cleanverse-backed ID+photo flow first, and
// that's enforced here server-side, not left to the frontend to hide a button.
export async function POST(request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const user = await db.query.users.findFirst({ where: eq(users.id, session.userId) });
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  if (user.verificationStatus !== "verified") {
    return NextResponse.json({ error: "Verify your identity before creating an artisan profile" }, { status: 403 });
  }

  const existing = await db.query.artisanProfiles.findFirst({ where: eq(artisanProfiles.userId, user.id) });
  if (existing) return NextResponse.json({ error: "You already have an artisan profile" }, { status: 409 });

  const parsed = createSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid profile details" }, { status: 400 });
  }

  const [profile] = await db.insert(artisanProfiles).values({ userId: user.id, ...parsed.data }).returning();
  return NextResponse.json({ profile });
}
