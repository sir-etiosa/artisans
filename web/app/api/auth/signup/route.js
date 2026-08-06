import { randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users, verificationTokens } from "@/db/schema";
import { hashPassword } from "@/lib/auth/password";
import { sendVerificationEmail } from "@/lib/email/send-verification-email";

const signupSchema = z.object({
  fullName: z.string().trim().min(2, "Full name is too short"),
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  phone: z.string().trim().optional(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["customer", "artisan"]),
});

const VERIFICATION_TTL_MS = 30 * 60 * 1000; // 30 minutes

export async function POST(request) {
  const body = await request.json().catch(() => null);
  const parsed = signupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid input" }, { status: 400 });
  }
  const { fullName, email, phone, password, role } = parsed.data;

  const existing = await db.query.users.findFirst({ where: eq(users.email, email) });
  if (existing) {
    return NextResponse.json({ error: "An account with that email already exists" }, { status: 409 });
  }

  const passwordHash = await hashPassword(password);
  const [user] = await db
    .insert(users)
    .values({ fullName, email, phone, passwordHash, role })
    .returning();

  const token = randomBytes(32).toString("hex");
  await db.insert(verificationTokens).values({
    userId: user.id,
    token,
    expiresAt: new Date(Date.now() + VERIFICATION_TTL_MS),
  });

  await sendVerificationEmail({ to: email, name: fullName, token });

  return NextResponse.json({ ok: true });
}
