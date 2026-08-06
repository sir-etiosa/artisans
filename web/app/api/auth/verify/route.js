import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users, verificationTokens } from "@/db/schema";
import { createSession } from "@/lib/auth/session";

export async function GET(request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");
  const appUrl = url.origin;

  if (!token) {
    return NextResponse.redirect(`${appUrl}/auth?error=missing_token`);
  }

  const record = await db.query.verificationTokens.findFirst({ where: eq(verificationTokens.token, token) });

  if (!record || record.expiresAt < new Date()) {
    return NextResponse.redirect(`${appUrl}/auth?error=invalid_token`);
  }

  const [user] = await db
    .update(users)
    .set({ emailVerified: true })
    .where(eq(users.id, record.userId))
    .returning();

  await db.delete(verificationTokens).where(eq(verificationTokens.id, record.id));

  await createSession({ userId: user.id, role: user.role });

  return NextResponse.redirect(`${appUrl}/activate`);
}
