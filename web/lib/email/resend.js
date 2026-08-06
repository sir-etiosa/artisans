import { Resend } from "resend";

let client;

export function getResendClient() {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is not set — add it to web/.env.local");
  }
  if (!client) client = new Resend(process.env.RESEND_API_KEY);
  return client;
}

export const EMAIL_FROM = process.env.RESEND_FROM_EMAIL || "The Artisans <onboarding@resend.dev>";
