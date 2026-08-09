import { NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { verificationReviews, users } from "@/db/schema";
import { requireAdmin } from "@/lib/auth/require-admin";
import { generateApass, queryApass, normalizeApassStatus } from "@/lib/cleanverse/apass";
import { decryptSecret } from "@/lib/crypto/secret";
import { logAuditEvent } from "@/lib/audit/log-event";

const decideSchema = z.object({
  decision: z.enum(["approved", "rejected"]),
  note: z.string().trim().max(500).optional(),
});

// Cleanverse is only ever contacted here, on approval — a rejected
// submission never creates an A-Pass in the first place, so there's
// nothing on Cleanverse's side to freeze/unfreeze either way.
export async function POST(request, { params }) {
  const guard = await requireAdmin(["support"]);
  if (guard.error) return NextResponse.json({ error: guard.error }, { status: guard.status });

  const { id } = await params;
  const parsed = decideSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid input" }, { status: 400 });
  }

  const review = await db.query.verificationReviews.findFirst({ where: eq(verificationReviews.id, id) });
  if (!review) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (review.reviewStatus !== "pending") {
    return NextResponse.json({ error: "Already decided" }, { status: 400 });
  }

  const user = await db.query.users.findFirst({ where: eq(users.id, review.userId) });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  let cleanverseRaw = null;

  if (parsed.data.decision === "rejected") {
    await db.update(users).set({ verificationStatus: "frozen" }).where(eq(users.id, user.id));
  }

  if (parsed.data.decision === "approved") {
    if (!user.walletAddress) return NextResponse.json({ error: "User has no wallet yet" }, { status: 400 });

    const { fullName, idNumber } = JSON.parse(decryptSecret(review.identityEnc));
    const genResult = await generateApass({
      userId: user.id,
      walletAddress: user.walletAddress,
      identity: { idType: review.idType, fullName, idNumber, issuingCountryISO2: review.issuingCountryIso2 },
    });
    const statusResult = await queryApass({ walletAddress: user.walletAddress });
    const normalized = normalizeApassStatus(statusResult);
    cleanverseRaw = normalized.raw;

    if (normalized.status === "not_connected" && !genResult.ok) {
      return NextResponse.json({ error: genResult.message || genResult.error || "Cleanverse request failed" }, { status: 502 });
    }

    await db
      .update(users)
      .set({ verificationStatus: normalized.status, verificationCheckedAt: new Date(), verificationRaw: normalized.raw })
      .where(eq(users.id, user.id));
  }

  await db
    .update(verificationReviews)
    .set({ reviewStatus: parsed.data.decision, reviewedBy: guard.user.id, reviewedAt: new Date(), reviewNote: parsed.data.note, cleanverseRaw })
    .where(eq(verificationReviews.id, id));

  await logAuditEvent({
    actorUserId: guard.user.id, actorEmail: guard.user.email,
    eventType: `verification_${parsed.data.decision}`, targetType: "user", targetId: user.id,
    metadata: { reviewId: id, note: parsed.data.note || null },
  });

  return NextResponse.json({ ok: true });
}
