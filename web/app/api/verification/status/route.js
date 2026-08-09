import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { getSession } from "@/lib/auth/session";
import { isCleanverseConfigured } from "@/lib/cleanverse/client";
import { queryApass, normalizeApassStatus } from "@/lib/cleanverse/apass";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const user = await db.query.users.findFirst({ where: eq(users.id, session.userId) });
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  // "pending" means no A-Pass exists yet — that's only created on admin
  // approval now, so there's nothing on Cleanverse's side to check yet.
  // Querying anyway would come back "not_connected" and silently wipe out
  // the pending state.
  if (!user.walletAddress || !isCleanverseConfigured() || user.verificationStatus === "pending") {
    return NextResponse.json({ user: { verificationStatus: user.verificationStatus } });
  }

  const statusResult = await queryApass({ walletAddress: user.walletAddress });
  const normalized = normalizeApassStatus(statusResult);

  const [updated] = await db
    .update(users)
    .set({ verificationStatus: normalized.status, verificationCheckedAt: new Date(), verificationRaw: normalized.raw })
    .where(eq(users.id, user.id))
    .returning();

  const { passwordHash, walletPrivateKeyEnc, verificationIdHash, ...publicUser } = updated;
  return NextResponse.json({ user: publicUser });
}
