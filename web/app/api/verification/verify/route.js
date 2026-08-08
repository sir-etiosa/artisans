import { NextResponse } from "next/server";
import { z } from "zod";
import { and, eq, ne } from "drizzle-orm";
import { db } from "@/db";
import { users, verificationReviews } from "@/db/schema";
import { getSession } from "@/lib/auth/session";
import { isCleanverseConfigured } from "@/lib/cleanverse/client";
import { generateApass, queryApass, normalizeApassStatus } from "@/lib/cleanverse/apass";
import { provisionWallet } from "@/lib/wallet/provision";
import { documentHash } from "@/lib/verification/document-hash";
import { encryptSecret } from "@/lib/crypto/secret";

const identitySchema = z.object({
  idType: z.enum(["ID_CARD", "PASSPORT", "DRIVER_LICENSE", "HK_MACAO_TAIWAN_PASS", "RESIDENCE_PERMIT"]),
  fullName: z.string().trim().min(2, "Full name is too short"),
  idNumber: z.string().trim().min(1, "ID number is required"),
  issuingCountryISO2: z.string().trim().toUpperCase().length(2, "Use a 2-letter country code"),
});

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export async function POST(request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  let user = await db.query.users.findFirst({ where: eq(users.id, session.userId) });
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  if (user.verificationStatus === "verified") {
    return NextResponse.json({ error: "Already verified" }, { status: 400 });
  }
  // Staff rejected a prior submission — no self-serve resubmit around that.
  if (user.verificationStatus === "frozen") {
    return NextResponse.json({ error: "This account failed review. Contact support." }, { status: 400 });
  }
  if (!isCleanverseConfigured()) {
    return NextResponse.json({ error: "Verification isn't configured yet" }, { status: 503 });
  }

  const formData = await request.formData().catch(() => null);
  if (!formData) return NextResponse.json({ error: "Invalid form submission" }, { status: 400 });

  const parsed = identitySchema.safeParse({
    idType: formData.get("idType"),
    fullName: formData.get("fullName"),
    idNumber: formData.get("idNumber"),
    issuingCountryISO2: formData.get("issuingCountryISO2"),
  });
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid ID details" }, { status: 400 });
  }

  // Cleanverse's own schema has no image field — this is our own fraud check,
  // so staff reviewing later can compare it against the typed details.
  const idImage = formData.get("idImage");
  if (!(idImage instanceof File) || idImage.size === 0) {
    return NextResponse.json({ error: "A photo of the ID is required" }, { status: 400 });
  }
  if (!ALLOWED_IMAGE_TYPES.includes(idImage.type)) {
    return NextResponse.json({ error: "ID photo must be a JPEG, PNG, or WebP image" }, { status: 400 });
  }
  if (idImage.size > MAX_IMAGE_BYTES) {
    return NextResponse.json({ error: "ID photo must be under 5MB" }, { status: 400 });
  }
  const idImageBuffer = Buffer.from(await idImage.arrayBuffer());

  const idHash = documentHash(parsed.data);
  const existingOwner = await db.query.users.findFirst({
    where: and(eq(users.verificationIdHash, idHash), ne(users.id, user.id)),
  });
  if (existingOwner) {
    return NextResponse.json({ error: "This ID is already linked to another account" }, { status: 409 });
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

  let updated;
  try {
    [updated] = await db
      .update(users)
      .set({ verificationStatus: normalized.status, verificationCheckedAt: new Date(), verificationRaw: normalized.raw, verificationIdHash: idHash })
      .where(eq(users.id, user.id))
      .returning();
  } catch (err) {
    // Unique-constraint race: someone else claimed this document between our check above and this write.
    if (err?.code === "23505") {
      return NextResponse.json({ error: "This ID is already linked to another account" }, { status: 409 });
    }
    throw err;
  }

  // Fraud-review record — kept regardless of outcome so staff have a
  // durable trail; the raw name/ID number only exist here, encrypted.
  await db.insert(verificationReviews).values({
    userId: user.id,
    idType: parsed.data.idType,
    issuingCountryIso2: parsed.data.issuingCountryISO2,
    identityEnc: encryptSecret(JSON.stringify({ fullName: parsed.data.fullName, idNumber: parsed.data.idNumber })),
    idImageEnc: encryptSecret(idImageBuffer.toString("base64")),
    idImageMimeType: idImage.type,
    documentHash: idHash,
    cleanverseRaw: normalized.raw,
  });

  const { passwordHash, walletPrivateKeyEnc, verificationIdHash: _idHash, ...publicUser } = updated;
  return NextResponse.json({ user: publicUser });
}
