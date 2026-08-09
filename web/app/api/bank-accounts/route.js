import { NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { bankAccounts, users } from "@/db/schema";
import { getSession } from "@/lib/auth/session";
import { resolveAccount, listBanks } from "@/lib/paystack/client";

const linkSchema = z.object({
  bankCode: z.string().min(1),
  accountNumber: z.string().trim().min(10).max(10, "Account number must be 10 digits"),
});

// Account name is never hand-typed — resolved from Paystack against the
// real bank + account number, so a typo can't send a withdrawal to the
// wrong person.
export async function POST(request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const user = await db.query.users.findFirst({ where: eq(users.id, session.userId) });
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  if (user.verificationStatus !== "verified") {
    return NextResponse.json({ error: "Verify your identity before linking a bank account" }, { status: 403 });
  }

  const parsed = linkSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid bank details" }, { status: 400 });
  }

  const resolved = await resolveAccount({ accountNumber: parsed.data.accountNumber, bankCode: parsed.data.bankCode });
  if (!resolved.ok) {
    return NextResponse.json({ error: resolved.message || "Couldn't verify that account" }, { status: 400 });
  }

  const banksResult = await listBanks();
  const bank = banksResult.ok ? banksResult.data.find((b) => b.code === parsed.data.bankCode) : null;

  const existing = await db.query.bankAccounts.findFirst({ where: eq(bankAccounts.userId, user.id) });
  const values = {
    userId: user.id,
    bankCode: parsed.data.bankCode,
    bankName: bank?.name || "Unknown bank",
    accountNumber: parsed.data.accountNumber,
    accountName: resolved.data.account_name,
  };

  const [bankAccount] = existing
    ? await db.update(bankAccounts).set(values).where(eq(bankAccounts.id, existing.id)).returning()
    : await db.insert(bankAccounts).values(values).returning();

  return NextResponse.json({ bankAccount });
}

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const bankAccount = await db.query.bankAccounts.findFirst({ where: eq(bankAccounts.userId, session.userId) });
  return NextResponse.json({ bankAccount: bankAccount || null });
}
