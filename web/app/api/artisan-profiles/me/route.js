import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { artisanProfiles } from "@/db/schema";
import { getSession } from "@/lib/auth/session";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const profile = await db.query.artisanProfiles.findFirst({ where: eq(artisanProfiles.userId, session.userId) });
  return NextResponse.json({ profile: profile || null });
}
