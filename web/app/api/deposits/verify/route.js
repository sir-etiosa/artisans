import { NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { deposits } from "@/db/schema";
import { getSession } from "@/lib/auth/session";
import { verifyTransaction } from "@/lib/paystack/client";

const schema = z.object({ reference: z.string().min(1) });

// Belt-and-suspenders alongside the webhook — the redirect back from Paystack
// isn't proof of payment on its own (per their docs), so we call Verify
// ourselves too. Whichever of the two (this or the webhook) lands first wins;
// both are idempotent against the same "pending" -> "awaiting_credit" move.
export async function POST(request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid reference" }, { status: 400 });

  const deposit = await db.query.deposits.findFirst({ where: eq(deposits.reference, parsed.data.reference) });
  if (!deposit || deposit.userId !== session.userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (deposit.status !== "pending") {
    return NextResponse.json({ deposit });
  }

  const result = await verifyTransaction(deposit.reference);
  if (!result.ok || result.data.status !== "success" || result.data.amount !== deposit.amountKobo) {
    if (result.ok && result.data.status !== "success") {
      await db.update(deposits).set({ status: "failed", paystackData: result.data }).where(eq(deposits.id, deposit.id));
    }
    return NextResponse.json({ error: "Payment not confirmed yet" }, { status: 202 });
  }

  const [updated] = await db
    .update(deposits)
    .set({ status: "awaiting_credit", paystackData: result.data })
    .where(eq(deposits.id, deposit.id))
    .returning();

  return NextResponse.json({ deposit: updated });
}
