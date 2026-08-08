import { NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { getSession } from "@/lib/auth/session";
import { isCleanverseConfigured } from "@/lib/cleanverse/client";
import { generateApass, queryApass, normalizeApassStatus } from "@/lib/cleanverse/apass";
import { provisionWallet } from "@/lib/wallet/provision";

const identitySchema = z.object({
  idType: z.enum(["ID_CARD", "PASSPORT", "DRIVER_LICENSE", "HK_MACAO_TAIWAN_PASS", "RESIDENCE_PERMIT"]),
  fullName: z.string().trim().min(2, "Full name is too short"),
  idNumber: z.string().trim().min(1, "ID number is required"),
  issuingCountryISO2: z.string().trim().toUpperCase().length(2, "Use a 2-letter country code"),
});

export async function POST(request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  let user = await db.query.users.findFirst({ where: eq(users.id, session.userId) });
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  if (user.verificationStatus === "verified") {
    return NextResponse.json({ error: "Already verified" }, { status: 400 });
  }
  if (!isCleanverseConfigured()) {
    return NextResponse.json({ error: "Verification isn't configured yet" }, { status: 503 });
  }

  const parsed = identitySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid ID details" }, { status: 400 });
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

  const genResult = await generateApass({ userId: user.id, walletAddress: user.walletAddress, identity: parsed.data });
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
