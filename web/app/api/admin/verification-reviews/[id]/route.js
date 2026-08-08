import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { verificationReviews, users } from "@/db/schema";
import { requireStaff } from "@/lib/auth/require-staff";
import { decryptSecret } from "@/lib/crypto/secret";

export async function GET(request, { params }) {
  const guard = await requireStaff();
  if (guard.error) return NextResponse.json({ error: guard.error }, { status: guard.status });

  const { id } = await params;
  const review = await db.query.verificationReviews.findFirst({ where: eq(verificationReviews.id, id) });
  if (!review) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const user = await db.query.users.findFirst({ where: eq(users.id, review.userId) });
  const identity = JSON.parse(decryptSecret(review.identityEnc));
  const idImageDataUrl = `data:${review.idImageMimeType};base64,${decryptSecret(review.idImageEnc)}`;

  const { identityEnc, idImageEnc, ...reviewMeta } = review;
  return NextResponse.json({
    review: { ...reviewMeta, fullName: identity.fullName, idNumber: identity.idNumber, idImageDataUrl },
    user: user ? { email: user.email, fullName: user.fullName, walletAddress: user.walletAddress, verificationStatus: user.verificationStatus } : null,
  });
}
