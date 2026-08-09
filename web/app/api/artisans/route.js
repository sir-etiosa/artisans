import { NextResponse } from "next/server";
import { and, desc, eq, ilike, isNull, or } from "drizzle-orm";
import { db } from "@/db";
import { artisanProfiles, users } from "@/db/schema";
import { shapeArtisan } from "@/lib/artisans/shape-artisan";
import { haversineKm } from "@/lib/geo/haversine";

const DEFAULT_PAGE_SIZE = 10;

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const trade = searchParams.get("trade");
  const q = searchParams.get("q")?.trim();
  // Customer's real coordinates, from the browser Geolocation API — absent
  // when location was denied/unavailable, in which case distance is unknown
  // rather than faked.
  const custLat = searchParams.get("lat") ? Number(searchParams.get("lat")) : null;
  const custLng = searchParams.get("lng") ? Number(searchParams.get("lng")) : null;
  const maxKm = searchParams.get("maxKm") ? Number(searchParams.get("maxKm")) : null;
  const minScore = searchParams.get("minScore") ? Number(searchParams.get("minScore")) : null;
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const pageSize = Math.min(48, Math.max(1, Number(searchParams.get("pageSize")) || DEFAULT_PAGE_SIZE));

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

  let withDistance = rows.map((row) => ({
    ...row,
    km: custLat != null && custLng != null && row.lat != null && row.lng != null
      ? Number(haversineKm(custLat, custLng, row.lat, row.lng).toFixed(1))
      : null,
  }));

  if (maxKm != null) withDistance = withDistance.filter((row) => row.km == null || row.km <= maxKm);
  if (minScore != null) withDistance = withDistance.filter((row) => row.trustScore >= minScore);

  const total = withDistance.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = (page - 1) * pageSize;
  const items = withDistance.slice(start, start + pageSize);

  return NextResponse.json({ artisans: items.map(shapeArtisan), total, page, pageSize, totalPages });
}
