import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { withdrawals, users, bankAccounts } from "@/db/schema";
import { requireAdmin } from "@/lib/auth/require-admin";

export async function GET(request) {
  const guard = await requireAdmin(["tx"]);
  if (guard.error) return NextResponse.json({ error: guard.error }, { status: guard.status });

  const url = new URL(request.url);
  const statusFilter = url.searchParams.get("status") || "pending";

  const columns = {
    id: withdrawals.id,
    userId: withdrawals.userId,
    userEmail: users.email,
    userFullName: users.fullName,
    artAmount: withdrawals.artAmount,
    amountKobo: withdrawals.amountKobo,
    status: withdrawals.status,
    createdAt: withdrawals.createdAt,
    bankName: bankAccounts.bankName,
    accountNumber: bankAccounts.accountNumber,
    accountName: bankAccounts.accountName,
  };

  const base = db
    .select(columns)
    .from(withdrawals)
    .innerJoin(users, eq(users.id, withdrawals.userId))
    .innerJoin(bankAccounts, eq(bankAccounts.id, withdrawals.bankAccountId));

  const rows = statusFilter === "all"
    ? await base.orderBy(desc(withdrawals.createdAt))
    : await base.where(eq(withdrawals.status, statusFilter)).orderBy(desc(withdrawals.createdAt));

  return NextResponse.json({ withdrawals: rows });
}
