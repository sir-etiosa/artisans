import { NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { getSession } from "@/lib/auth/session";

const walletSchema = z.object({
  address: z.string().trim().min(1),
  chain: z.enum(["base", "monad"]),
});

export async function POST(request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = walletSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid wallet payload" }, { status: 400 });
  }

  await db
    .update(users)
    .set({ walletAddress: parsed.data.address, walletChain: parsed.data.chain })
    .where(eq(users.id, session.userId));

  return NextResponse.json({ ok: true });
}
