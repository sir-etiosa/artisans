import { NextResponse } from "next/server";
import { and, desc, eq, ilike, isNull, or } from "drizzle-orm";
import { db } from "@/db";
import { artisanProfiles, users } from "@/db/schema";
import { shapeArtisan } from "@/lib/artisans/shape-artisan";
import { haversineKm } from "@/lib/geo/haversine";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const trade = searchParams.get("trade");
  const q = searchParams.get("q")?.trim();
  // Customer's real coordinates, from the browser Geolocation API — absent
  // when location was denied/unavailable, in which case distance is unknown
  // rather than faked.
  const custLat = searchParams.get("lat") ? Number(searchParams.get("lat")) : null;
  const custLng = searchParams.get("lng") ? Number(searchParams.get("lng")) : null;

  // Having a row in artisan_profiles (via the join below) is what makes
  // someone an artisan — not the account's `role`, since any account can
  // create a profile once verified.
  const conditions = [isNull(artisanProfiles.deletedAt)];
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
      lat: artisanProfiles.lat,
      lng: artisanProfiles.lng,
      rate: artisanProfiles.rate,
      trustScore: artisanProfiles.trustScore,
      rating: artisanProfiles.rating,
      jobsCompleted: artisanProfiles.jobsCompleted,
      responseMinutes: artisanProfiles.responseMinutes,
      createdAt: users.createdAt,
    })
    .from(artisanProfiles)
    .innerJoin(users, eq(users.id, artisanProfiles.userId))
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(artisanProfiles.trustScore));

  const withDistance = rows.map((row) => ({
    ...row,
    km: custLat != null && custLng != null && row.lat != null && row.lng != null
      ? Number(haversineKm(custLat, custLng, row.lat, row.lng).toFixed(1))
      : null,
  }));

  return NextResponse.json({ artisans: withDistance.map(shapeArtisan) });
}
