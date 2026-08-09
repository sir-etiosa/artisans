import { NextResponse } from "next/server";
import { z } from "zod";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { withdrawals, bankAccounts, users } from "@/db/schema";
import { getSession } from "@/lib/auth/session";
import { artToKobo } from "@/lib/art/send-art";

const createSchema = z.object({ artAmount: z.coerce.number().min(1) });

export async function POST(request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const user = await db.query.users.findFirst({ where: eq(users.id, session.userId) });
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  if (user.verificationStatus !== "verified") {
    return NextResponse.json({ error: "Verify your identity before withdrawing" }, { status: 403 });
  }

  const bankAccount = await db.query.bankAccounts.findFirst({ where: eq(bankAccounts.userId, user.id) });
  if (!bankAccount) return NextResponse.json({ error: "Link a bank account first" }, { status: 400 });

  const parsed = createSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid amount" }, { status: 400 });
  }

  const [withdrawal] = await db
    .insert(withdrawals)
    .values({
      userId: user.id,
      bankAccountId: bankAccount.id,
      artAmount: parsed.data.artAmount,
      amountKobo: artToKobo(parsed.data.artAmount),
    })
    .returning();

  return NextResponse.json({ withdrawal });
}

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const rows = await db.query.withdrawals.findMany({
    where: eq(withdrawals.userId, session.userId),
    orderBy: desc(withdrawals.createdAt),
  });
  return NextResponse.json({ withdrawals: rows });
}
