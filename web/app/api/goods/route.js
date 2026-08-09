import { NextResponse } from "next/server";
import { z } from "zod";
import { and, desc, eq, ilike, isNull, or } from "drizzle-orm";
import { db } from "@/db";
import { goodsListings, artisanProfiles, users } from "@/db/schema";
import { getSession } from "@/lib/auth/session";
import { haversineKm } from "@/lib/geo/haversine";

const DEFAULT_PAGE_SIZE = 12;

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const q = searchParams.get("q")?.trim();
  const custLat = searchParams.get("lat") ? Number(searchParams.get("lat")) : null;
  const custLng = searchParams.get("lng") ? Number(searchParams.get("lng")) : null;
  const maxKm = searchParams.get("maxKm") ? Number(searchParams.get("maxKm")) : null;
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const pageSize = Math.min(48, Math.max(1, Number(searchParams.get("pageSize")) || DEFAULT_PAGE_SIZE));

  const conditions = [isNull(goodsListings.deletedAt)];
  if (category && category !== "All") conditions.push(eq(goodsListings.category, category));
  if (q) conditions.push(or(ilike(goodsListings.name, `%${q}%`), ilike(goodsListings.description, `%${q}%`)));

  const rows = await db
    .select({
      id: goodsListings.id,
      name: goodsListings.name,
      category: goodsListings.category,
      priceNaira: goodsListings.priceNaira,
      condition: goodsListings.condition,
      description: goodsListings.description,
      images: goodsListings.images,
      lat: goodsListings.lat,
      lng: goodsListings.lng,
      createdAt: goodsListings.createdAt,
      sellerName: users.fullName,
      sellerArea: artisanProfiles.area,
    })
    .from(goodsListings)
    .innerJoin(artisanProfiles, eq(artisanProfiles.id, goodsListings.sellerProfileId))
    .innerJoin(users, eq(users.id, goodsListings.userId))
    .where(and(...conditions))
    .orderBy(desc(goodsListings.createdAt));

  let withDistance = rows.map((row) => ({
    ...row,
    km: custLat != null && custLng != null && row.lat != null && row.lng != null
      ? Number(haversineKm(custLat, custLng, row.lat, row.lng).toFixed(1))
      : null,
  }));

  if (maxKm != null) withDistance = withDistance.filter((row) => row.km == null || row.km <= maxKm);

  const total = withDistance.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = (page - 1) * pageSize;
  const items = withDistance.slice(start, start + pageSize);

  return NextResponse.json({ goods: items, total, page, pageSize, totalPages });
}

const createSchema = z.object({
  name: z.string().trim().min(2, "Name is required").max(120),
  category: z.string().trim().min(2, "Category is required").max(60),
  priceNaira: z.coerce.number().int().positive("Price must be a positive number"),
  condition: z.enum(["new"]).optional(),
  description: z.string().trim().max(1000).optional(),
  images: z.array(z.string().url()).min(2, "Add at least 2 images").max(6, "Add at most 6 images"),
  lat: z.coerce.number().min(-90).max(90).optional(),
  lng: z.coerce.number().min(-180).max(180).optional(),
});

// Posting goods requires an active artisan profile — goods are managed
// from the artisan dashboard alongside services, not a separate account type.
export async function POST(request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const user = await db.query.users.findFirst({ where: eq(users.id, session.userId) });
  if (!user || user.verificationStatus !== "verified") {
    return NextResponse.json({ error: "Verify your identity before posting goods" }, { status: 403 });
  }
  const profile = await db.query.artisanProfiles.findFirst({
    where: and(eq(artisanProfiles.userId, user.id), isNull(artisanProfiles.deletedAt)),
  });
  if (!profile) return NextResponse.json({ error: "Create your artisan profile before posting goods" }, { status: 403 });

  const parsed = createSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid listing details" }, { status: 400 });
  }

  const [listing] = await db
    .insert(goodsListings)
    .values({ userId: user.id, sellerProfileId: profile.id, ...parsed.data })
    .returning();
  return NextResponse.json({ listing });
}
