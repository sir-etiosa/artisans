import { NextResponse } from "next/server";
import { and, desc, eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import { goodsListings } from "@/db/schema";
import { getSession } from "@/lib/auth/session";

// Backs the dashboard's "manage your listings" section.
export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const rows = await db.query.goodsListings.findMany({
    where: and(eq(goodsListings.userId, session.userId), isNull(goodsListings.deletedAt)),
    orderBy: desc(goodsListings.createdAt),
  });
  return NextResponse.json({ goods: rows });
}
