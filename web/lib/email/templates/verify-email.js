export function verifyEmailTemplate({ name, verifyUrl, logoUrl }) {
  return {
    subject: "Verify your email — The Artisans",
    html: `
      <div style="font-family:'Inter',system-ui,sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;color:#0F2559;">
        <img src="${logoUrl}" alt="The Artisans" width="36" height="36" style="border-radius:6px;display:block;margin:0 0 12px;" />
        <p style="font-size:12px;font-weight:600;letter-spacing:.14em;text-transform:uppercase;color:#C9962E;margin:0 0 16px;">THE ARTISANS</p>
        <h1 style="font-size:22px;margin:0 0 12px;">Hi ${name.split(" ")[0]}, confirm your email</h1>
        <p style="font-size:15px;line-height:1.5;color:#57607A;margin:0 0 24px;">
          One click and you're verified. This link expires in 30 minutes.
        </p>
        <a href="${verifyUrl}"
          style="display:inline-block;background:#0F2559;color:#ffffff;text-decoration:none;font-weight:600;font-size:14px;padding:12px 24px;border-radius:999px;">
          Verify email
        </a>
        <p style="font-size:12px;color:#93A0BF;margin:24px 0 0;">
          Didn't create an account with The Artisans? You can ignore this email.
        </p>
      </div>
    `,
  };
}
