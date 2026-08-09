import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { withdrawals, bankAccounts, users } from "@/db/schema";
import { requireAdmin } from "@/lib/auth/require-admin";
import { isArtTokenConfigured, returnArtToTreasury } from "@/lib/art/send-art";
import { createTransferRecipient, initiateTransfer } from "@/lib/paystack/client";

export async function POST(request, { params }) {
  const guard = await requireAdmin(["tx"]);
  if (guard.error) return NextResponse.json({ error: guard.error }, { status: guard.status });

  const { id } = await params;
  const withdrawal = await db.query.withdrawals.findFirst({ where: eq(withdrawals.id, id) });
  if (!withdrawal) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (withdrawal.status !== "pending") return NextResponse.json({ error: "Already processed" }, { status: 400 });

  // Block until the ART side can actually move — paying out NGN without
  // verifiably taking the ART back would be a real accounting mismatch,
  // same principle as the deposit-approval gate.
  if (!isArtTokenConfigured()) {
    return NextResponse.json({ error: "ART token isn't wired up yet — can't verify the ART side of this withdrawal" }, { status: 503 });
  }

  const user = await db.query.users.findFirst({ where: eq(users.id, withdrawal.userId) });
  const artResult = await returnArtToTreasury({ fromAddress: user?.walletAddress, amountArt: withdrawal.artAmount });
  if (!artResult.ok) return NextResponse.json({ error: artResult.error }, { status: 502 });

  const bankAccount = await db.query.bankAccounts.findFirst({ where: eq(bankAccounts.id, withdrawal.bankAccountId) });

  let recipientCode = bankAccount.paystackRecipientCode;
  if (!recipientCode) {
    const recipientResult = await createTransferRecipient({
      accountNumber: bankAccount.accountNumber,
      bankCode: bankAccount.bankCode,
      accountName: bankAccount.accountName,
    });
    if (!recipientResult.ok) return NextResponse.json({ error: recipientResult.message || "Couldn't set up payout recipient" }, { status: 502 });
    recipientCode = recipientResult.data.recipient_code;
    await db.update(bankAccounts).set({ paystackRecipientCode: recipientCode }).where(eq(bankAccounts.id, bankAccount.id));
  }

  const transferRef = `wd_${randomUUID()}`;
  const transferResult = await initiateTransfer({
    amountKobo: withdrawal.amountKobo,
    recipientCode,
    reference: transferRef,
    reason: "The Artisans — ART withdrawal",
  });
  if (!transferResult.ok) return NextResponse.json({ error: transferResult.message || "Transfer failed" }, { status: 502 });

  const [updated] = await db
    .update(withdrawals)
    .set({
      status: "paid",
      reviewedBy: guard.user.id,
      reviewedAt: new Date(),
      paystackTransferCode: transferResult.data.transfer_code,
      paystackTransferRef: transferRef,
      artReturnTxHash: artResult.txHash,
    })
    .where(eq(withdrawals.id, id))
    .returning();

  return NextResponse.json({ withdrawal: updated });
}
