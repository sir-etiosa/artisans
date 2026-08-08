import { NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { verificationReviews, users } from "@/db/schema";
import { requireStaff } from "@/lib/auth/require-staff";
import { updateApassStatus, queryApass, normalizeApassStatus } from "@/lib/cleanverse/apass";

const decideSchema = z.object({
  decision: z.enum(["approved", "rejected"]),
  note: z.string().trim().max(500).optional(),
});

export async function POST(request, { params }) {
  const guard = await requireStaff();
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

  // Reject freezes the account's A-Pass on Cleanverse's side too, so both
  // systems agree — otherwise the wallet would stay "verified" there.
  if (parsed.data.decision === "rejected" && user.walletAddress) {
    await updateApassStatus({
      walletAddress: user.walletAddress,
      status: "2",
      blacklistReason: parsed.data.note || "Failed manual review",
    });
    await db.update(users).set({ verificationStatus: "frozen" }).where(eq(users.id, user.id));
  }

  // Approve must actively unfreeze — generate_apass does NOT clear a prior
  // freeze on its own (confirmed live: a resubmission on a frozen wallet
  // still came back status 2), so without this an approval after any earlier
  // rejection silently did nothing to the user's real status.
  if (parsed.data.decision === "approved" && user.walletAddress) {
    await updateApassStatus({ walletAddress: user.walletAddress, status: "1" });
    const statusResult = await queryApass({ walletAddress: user.walletAddress });
    const normalized = normalizeApassStatus(statusResult);
    await db
      .update(users)
      .set({ verificationStatus: normalized.status, verificationCheckedAt: new Date(), verificationRaw: normalized.raw })
      .where(eq(users.id, user.id));
  }

  await db
    .update(verificationReviews)
    .set({ reviewStatus: parsed.data.decision, reviewedBy: guard.user.id, reviewedAt: new Date(), reviewNote: parsed.data.note })
    .where(eq(verificationReviews.id, id));

  return NextResponse.json({ ok: true });
}
