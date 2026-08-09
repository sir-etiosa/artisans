import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { deposits, users } from "@/db/schema";
import { requireAdmin } from "@/lib/auth/require-admin";

export async function GET(request) {
  const guard = await requireAdmin(["tx"]);
  if (guard.error) return NextResponse.json({ error: guard.error }, { status: guard.status });

  const url = new URL(request.url);
  const statusFilter = url.searchParams.get("status") || "awaiting_credit";

  const columns = {
    id: deposits.id,
    userId: deposits.userId,
    userEmail: users.email,
    userFullName: users.fullName,
    walletAddress: users.walletAddress,
    amountKobo: deposits.amountKobo,
    reference: deposits.reference,
    status: deposits.status,
    createdAt: deposits.createdAt,
    creditedAt: deposits.creditedAt,
  };

  const base = db.select(columns).from(deposits).innerJoin(users, eq(deposits.userId, users.id));
  const rows = statusFilter === "all"
    ? await base.orderBy(desc(deposits.createdAt))
    : await base.where(eq(deposits.status, statusFilter)).orderBy(desc(deposits.createdAt));

  return NextResponse.json({ deposits: rows });
}
