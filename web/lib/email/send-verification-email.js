import { getResendClient, EMAIL_FROM } from "./resend";
import { verifyEmailTemplate } from "./templates/verify-email";

export async function sendVerificationEmail({ to, name, token }) {
  const appUrl = process.env.APP_URL || "http://localhost:3000";
  const verifyUrl = `${appUrl}/api/auth/verify?token=${token}`;
  const { subject, html } = verifyEmailTemplate({ name, verifyUrl, logoUrl: `${appUrl}/logo.png` });

  const resend = getResendClient();
  return resend.emails.send({ from: EMAIL_FROM, to, subject, html });
}
