import { NextResponse } from "next/server";
import { isNull, sql } from "drizzle-orm";
import { db } from "@/db";
import { goodsListings } from "@/db/schema";

// Powers the home page's Goods tiles and the /goods filter chips — real
// counts per category, same pattern as /api/artisans/categories.
export async function GET() {
  const rows = await db
    .select({ category: goodsListings.category, count: sql`count(*)`.mapWith(Number) })
    .from(goodsListings)
    .where(isNull(goodsListings.deletedAt))
    .groupBy(goodsListings.category)
    .orderBy(sql`count(*) desc`);

  return NextResponse.json({ categories: rows });
}
