import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { getSession } from "@/lib/auth/session";
import { isCleanverseConfigured } from "@/lib/cleanverse/client";
import { generateApass, queryApass, normalizeApassStatus } from "@/lib/cleanverse/apass";
import { provisionWallet } from "@/lib/wallet/provision";

export async function POST() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  let user = await db.query.users.findFirst({ where: eq(users.id, session.userId) });
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  if (!isCleanverseConfigured()) {
    return NextResponse.json({ error: "Verification isn't configured yet" }, { status: 503 });
  }

  // Accounts verified before wallet provisioning existed won't have one yet.
  if (!user.walletAddress) {
    const wallet = provisionWallet();
    [user] = await db
      .update(users)
      .set({ walletAddress: wallet.address, walletChain: "monad", walletPrivateKeyEnc: wallet.encryptedPrivateKey })
      .where(eq(users.id, user.id))
      .returning();
  }

  const genResult = await generateApass({ userId: user.id, walletAddress: user.walletAddress });
  const statusResult = await queryApass({ walletAddress: user.walletAddress });
  const normalized = normalizeApassStatus(statusResult);

  // Generation can fail on a retry (A-Pass already exists for this wallet) —
  // that's fine as long as the status query below actually found a record.
  if (normalized.status === "not_connected" && !genResult.ok) {
    return NextResponse.json({ error: genResult.message || genResult.error || "Verification request failed" }, { status: 502 });
  }

  const [updated] = await db
    .update(users)
    .set({ verificationStatus: normalized.status, verificationCheckedAt: new Date(), verificationRaw: normalized.raw })
    .where(eq(users.id, user.id))
    .returning();

  const { passwordHash, walletPrivateKeyEnc, ...publicUser } = updated;
  return NextResponse.json({ user: publicUser });
}
