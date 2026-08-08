import { NextResponse } from "next/server";
import { and, desc, eq, ilike, or } from "drizzle-orm";
import { db } from "@/db";
import { artisanProfiles, users } from "@/db/schema";
import { shapeArtisan } from "@/lib/artisans/shape-artisan";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const trade = searchParams.get("trade");
  const q = searchParams.get("q")?.trim();

  const conditions = [eq(users.role, "artisan")];
  if (trade && trade !== "All") conditions.push(eq(artisanProfiles.trade, trade));
  if (q) {
    conditions.push(
      or(ilike(users.fullName, `%${q}%`), ilike(artisanProfiles.trade, `%${q}%`), ilike(artisanProfiles.tagline, `%${q}%`))
    );
  }

  const rows = await db
    .select({
      id: users.id,
      fullName: users.fullName,
      trade: artisanProfiles.trade,
      tagline: artisanProfiles.tagline,
      area: artisanProfiles.area,
      rate: artisanProfiles.rate,
      trustScore: artisanProfiles.trustScore,
      rating: artisanProfiles.rating,
      jobsCompleted: artisanProfiles.jobsCompleted,
      responseMinutes: artisanProfiles.responseMinutes,
      createdAt: users.createdAt,
    })
    .from(artisanProfiles)
    .innerJoin(users, eq(users.id, artisanProfiles.userId))
    .where(and(...conditions))
    .orderBy(desc(artisanProfiles.trustScore));

  return NextResponse.json({ artisans: rows.map(shapeArtisan) });
}
