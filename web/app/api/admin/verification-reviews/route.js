import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { verificationReviews, users } from "@/db/schema";
import { requireStaff } from "@/lib/auth/require-staff";

export async function GET(request) {
  const guard = await requireStaff();
  if (guard.error) return NextResponse.json({ error: guard.error }, { status: guard.status });

  const url = new URL(request.url);
  const statusFilter = url.searchParams.get("status") || "pending";

  const columns = {
    id: verificationReviews.id,
    userId: verificationReviews.userId,
    userEmail: users.email,
    userFullName: users.fullName,
    idType: verificationReviews.idType,
    issuingCountryIso2: verificationReviews.issuingCountryIso2,
    reviewStatus: verificationReviews.reviewStatus,
    createdAt: verificationReviews.createdAt,
    reviewedAt: verificationReviews.reviewedAt,
  };

  const base = db.select(columns).from(verificationReviews).innerJoin(users, eq(verificationReviews.userId, users.id));
  const rows = statusFilter === "all"
    ? await base.orderBy(desc(verificationReviews.createdAt))
    : await base.where(eq(verificationReviews.reviewStatus, statusFilter)).orderBy(desc(verificationReviews.createdAt));

  return NextResponse.json({ reviews: rows });
}
