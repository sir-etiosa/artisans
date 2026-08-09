import { NextResponse } from "next/server";
import { z } from "zod";
import { randomUUID } from "crypto";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { deposits, users } from "@/db/schema";
import { getSession } from "@/lib/auth/session";
import { isPaystackConfigured, initializeTransaction, nairaToKobo } from "@/lib/paystack/client";

const createSchema = z.object({ amountNaira: z.coerce.number().min(100, "Minimum deposit is ₦100").max(5_000_000) });

export async function POST(request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const user = await db.query.users.findFirst({ where: eq(users.id, session.userId) });
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  if (user.verificationStatus !== "verified") {
    return NextResponse.json({ error: "Verify your identity before you can deposit" }, { status: 403 });
  }
  if (!isPaystackConfigured()) {
    return NextResponse.json({ error: "Deposits aren't configured yet" }, { status: 503 });
  }

  const parsed = createSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid amount" }, { status: 400 });
  }

  const reference = `dep_${randomUUID()}`;
  const amountKobo = nairaToKobo(parsed.data.amountNaira);
  const appUrl = process.env.APP_URL || "http://localhost:3000";

  const result = await initializeTransaction({
    email: user.email,
    amountKobo,
    reference,
    callbackUrl: `${appUrl}/deposit/callback`,
    metadata: { userId: user.id },
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.message || "Couldn't start the deposit" }, { status: 502 });
  }

  await db.insert(deposits).values({ userId: user.id, reference, amountKobo, status: "pending", paystackData: result.data });

  return NextResponse.json({ authorizationUrl: result.data.authorization_url, reference });
}
