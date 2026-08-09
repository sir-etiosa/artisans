import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { users, verificationReviews } from "@/db/schema";
import { getSession } from "@/lib/auth/session";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const user = await db.query.users.findFirst({ where: eq(users.id, session.userId) });
  if (!user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  // Cleanverse can verify instantly, but that's not the whole story — a
  // human still has to clear the fraud-check pass before we call someone
  // "Verified". Until that happens, show them as pending even though the
  // underlying status may already say verified.
  const latestReview = await db.query.verificationReviews.findFirst({
    where: eq(verificationReviews.userId, user.id),
    orderBy: desc(verificationReviews.createdAt),
  });

  const { passwordHash, walletPrivateKeyEnc, verificationIdHash, ...publicUser } = user;
  return NextResponse.json({ user: { ...publicUser, hasPendingReview: latestReview?.reviewStatus === "pending" } });
}
