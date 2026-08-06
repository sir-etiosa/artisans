import { getResendClient, EMAIL_FROM } from "./resend";
import { verifyEmailTemplate } from "./templates/verify-email";

export async function sendVerificationEmail({ to, name, token }) {
  const verifyUrl = `${process.env.APP_URL || "http://localhost:3000"}/api/auth/verify?token=${token}`;
  const { subject, html } = verifyEmailTemplate({ name, verifyUrl });

  const resend = getResendClient();
  return resend.emails.send({ from: EMAIL_FROM, to, subject, html });
}
