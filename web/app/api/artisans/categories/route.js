import { NextResponse } from "next/server";
import { isNull, sql } from "drizzle-orm";
import { db } from "@/db";
import { artisanProfiles } from "@/db/schema";

// Powers the home page's "Popular near you" tiles — real counts per trade.
export async function GET() {
  const rows = await db
    .select({ trade: artisanProfiles.trade, count: sql`count(*)`.mapWith(Number) })
    .from(artisanProfiles)
    .where(isNull(artisanProfiles.deletedAt))
    .groupBy(artisanProfiles.trade)
    .orderBy(sql`count(*) desc`);

  return NextResponse.json({ categories: rows });
}
