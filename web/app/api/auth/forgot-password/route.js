import { NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users, passwordResetTokens } from "@/db/schema";
import { generateToken, expiresInMinutes } from "@/lib/auth/token";
import { sendResetPasswordEmail } from "@/lib/email/send-reset-password-email";

const schema = z.object({
  email: z.string().trim().toLowerCase().email(),
});

export async function POST(request) {
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a valid email" }, { status: 400 });
  }

  const user = await db.query.users.findFirst({ where: eq(users.email, parsed.data.email) });

  // Always respond the same way whether or not the account exists —
  // don't let this endpoint reveal which emails are registered.
  if (user) {
    const token = generateToken();
    await db.insert(passwordResetTokens).values({
      userId: user.id,
      token,
      expiresAt: expiresInMinutes(30),
    });
    await sendResetPasswordEmail({ to: user.email, name: user.fullName, token });
  }

  return NextResponse.json({ ok: true });
}
