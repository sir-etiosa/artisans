import { getResendClient, EMAIL_FROM } from "./resend";
import { resetPasswordTemplate } from "./templates/reset-password";

export async function sendResetPasswordEmail({ to, name, token }) {
  const resetUrl = `${process.env.APP_URL || "http://localhost:3000"}/reset-password?token=${token}`;
  const { subject, html } = resetPasswordTemplate({ name, resetUrl });

  const resend = getResendClient();
  return resend.emails.send({ from: EMAIL_FROM, to, subject, html });
}
