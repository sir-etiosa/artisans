import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { deposits, users } from "@/db/schema";
import { requireAdmin } from "@/lib/auth/require-admin";
import { sendArtToUser, isArtTokenConfigured, koboToArt } from "@/lib/art/send-art";

export async function POST(request, { params }) {
  const guard = await requireAdmin(["tx"]);
  if (guard.error) return NextResponse.json({ error: guard.error }, { status: guard.status });

  const { id } = await params;
  const deposit = await db.query.deposits.findFirst({ where: eq(deposits.id, id) });
  if (!deposit) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (deposit.status !== "awaiting_credit") {
    return NextResponse.json({ error: "Not awaiting credit" }, { status: 400 });
  }
  if (!isArtTokenConfigured()) {
    return NextResponse.json({ error: "ART token isn't deployed yet — nothing to send" }, { status: 503 });
  }

  const user = await db.query.users.findFirst({ where: eq(users.id, deposit.userId) });
  const sendResult = await sendArtToUser({ toAddress: user?.walletAddress, amountArt: koboToArt(deposit.amountKobo) });
  if (!sendResult.ok) return NextResponse.json({ error: sendResult.error }, { status: 502 });

  const [updated] = await db
    .update(deposits)
    .set({ status: "credited", creditedBy: guard.user.id, creditedAt: new Date(), artTxHash: sendResult.txHash })
    .where(eq(deposits.id, id))
    .returning();

  return NextResponse.json({ deposit: updated });
}
