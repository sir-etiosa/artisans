import { NextResponse } from "next/server";
import { z } from "zod";
import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import { goodsListings } from "@/db/schema";
import { getSession } from "@/lib/auth/session";

const ownListing = (id, userId) => and(eq(goodsListings.id, id), eq(goodsListings.userId, userId), isNull(goodsListings.deletedAt));

const updateSchema = z.object({
  name: z.string().trim().min(2).max(120).optional(),
  category: z.string().trim().min(2).max(60).optional(),
  priceNaira: z.coerce.number().int().positive().optional(),
  condition: z.enum(["new"]).nullable().optional(),
  description: z.string().trim().max(1000).optional(),
  images: z.array(z.string().url()).min(2, "Add at least 2 images").max(6, "Add at most 6 images").optional(),
});

export async function PATCH(request, { params }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const { id } = await params;
  const existing = await db.query.goodsListings.findFirst({ where: ownListing(id, session.userId) });
  if (!existing) return NextResponse.json({ error: "Listing not found" }, { status: 404 });

  const parsed = updateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid listing details" }, { status: 400 });
  }

  const [listing] = await db.update(goodsListings).set(parsed.data).where(eq(goodsListings.id, existing.id)).returning();
  return NextResponse.json({ listing });
}

export async function DELETE(request, { params }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const { id } = await params;
  const existing = await db.query.goodsListings.findFirst({ where: ownListing(id, session.userId) });
  if (!existing) return NextResponse.json({ error: "Listing not found" }, { status: 404 });

  await db.update(goodsListings).set({ deletedAt: new Date() }).where(eq(goodsListings.id, existing.id));
  return NextResponse.json({ ok: true });
}
