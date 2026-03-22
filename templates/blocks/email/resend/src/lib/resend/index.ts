// FILE: src/lib/email/index.ts
// ROUTE: not a route — imported anywhere that sends email
// ROLE: Resend provider implementation
//
// INJECTED BY CLI when user picks "Resend" as their email provider.
// Replaces templates/base/src/lib/email/index.ts
// ─────────────────────────────────────────────────────────────────────────────

import { Resend } from "resend";

// Resend client — reads API key from env
const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = "You <hello@yourdomain.com>"; // TODO: replace with your verified Resend domain

// ─── sendWelcomeEmail ─────────────────────────────────────────────────────────
export async function sendWelcomeEmail({
  to,
  name,
}: {
  to: string;
  name: string;
}) {
  await resend.emails.send({
    from: FROM,
    to,
    subject: "Welcome! 🎉",
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:40px 20px">
        <h1 style="font-size:24px;color:#111">Hey ${name}, welcome aboard!</h1>
        <p style="color:#555;line-height:1.7">Your account is ready. Click below to get started.</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard"
           style="display:inline-block;margin-top:20px;padding:12px 24px;background:#111;color:#fff;border-radius:6px;text-decoration:none">
          Go to Dashboard →
        </a>
      </div>
    `,
  });
}

// ─── sendPasswordResetEmail ───────────────────────────────────────────────────
export async function sendPasswordResetEmail({
  to,
  resetUrl,
}: {
  to: string;
  resetUrl: string;
}) {
  await resend.emails.send({
    from: FROM,
    to,
    subject: "Reset your password",
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:40px 20px">
        <h1 style="font-size:24px;color:#111">Reset your password</h1>
        <p style="color:#555;line-height:1.7">Click below to reset your password. Link expires in 1 hour.</p>
        <a href="${resetUrl}"
           style="display:inline-block;margin-top:20px;padding:12px 24px;background:#111;color:#fff;border-radius:6px;text-decoration:none">
          Reset Password →
        </a>
        <p style="margin-top:24px;color:#999;font-size:12px">If you didn't request this, ignore this email.</p>
      </div>
    `,
  });
}
