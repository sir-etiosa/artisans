import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { getSession } from "@/lib/auth/session";
import { getArtBalance, NAIRA_PER_ART, isArtTokenConfigured } from "@/lib/art/send-art";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const user = await db.query.users.findFirst({ where: eq(users.id, session.userId) });
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  if (!isArtTokenConfigured() || !user.walletAddress) {
    return NextResponse.json({ balanceArt: null, balanceNgn: null });
  }

  const balanceArt = await getArtBalance(user.walletAddress);
  return NextResponse.json({ balanceArt, balanceNgn: balanceArt != null ? Math.round(balanceArt * NAIRA_PER_ART) : null });
}
