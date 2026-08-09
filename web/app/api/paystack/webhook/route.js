import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { deposits } from "@/db/schema";
import { verifyPaystackSignature } from "@/lib/paystack/verify-webhook-signature";

// Server-to-server from Paystack — no session cookie, must stay on the
// public-path allowlist in lib/auth/route-guard.js or their POST never reaches here.
export async function POST(request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-paystack-signature");

  if (!verifyPaystackSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const event = JSON.parse(rawBody);

  if (event.event === "charge.success") {
    const reference = event.data.reference;
    const deposit = await db.query.deposits.findFirst({ where: eq(deposits.reference, reference) });
    // Idempotent — Paystack retries undelivered webhooks for up to 72h, so a
    // duplicate delivery for an already-processed reference is a no-op.
    if (deposit && deposit.status === "pending") {
      await db.update(deposits).set({ status: "awaiting_credit", paystackData: event.data }).where(eq(deposits.id, deposit.id));
    }
  }

  return NextResponse.json({ received: true });
}
