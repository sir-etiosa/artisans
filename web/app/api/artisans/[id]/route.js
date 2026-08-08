import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { artisanProfiles, users } from "@/db/schema";
import { shapeArtisan } from "@/lib/artisans/shape-artisan";

export async function GET(request, { params }) {
  const { id } = await params;

  const [row] = await db
    .select({
      id: users.id,
      fullName: users.fullName,
      email: users.email,
      trade: artisanProfiles.trade,
      tagline: artisanProfiles.tagline,
      area: artisanProfiles.area,
      bio: artisanProfiles.bio,
      yearsExperience: artisanProfiles.yearsExperience,
      rate: artisanProfiles.rate,
      trustScore: artisanProfiles.trustScore,
      rating: artisanProfiles.rating,
      jobsCompleted: artisanProfiles.jobsCompleted,
      responseMinutes: artisanProfiles.responseMinutes,
      repeatClientPct: artisanProfiles.repeatClientPct,
      certs: artisanProfiles.certs,
      breakdown: artisanProfiles.breakdown,
      createdAt: users.createdAt,
    })
    .from(artisanProfiles)
    .innerJoin(users, eq(users.id, artisanProfiles.userId))
    .where(eq(users.id, id));

  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ artisan: shapeArtisan(row) });
}
