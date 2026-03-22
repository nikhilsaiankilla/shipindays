// FILE: src/lib/email/index.ts
// ROUTE: not a route — imported anywhere that sends email
// ROLE: Nodemailer provider implementation
//
// INJECTED BY CLI when user picks "Nodemailer" as their email provider.
// Replaces templates/base/src/lib/email/index.ts
// ─────────────────────────────────────────────────────────────────────────────

import nodemailer from "nodemailer";

// Nodemailer transport — reads SMTP config from env
// Works with Gmail, Outlook, Mailgun SMTP, any SMTP server
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

const FROM = process.env.SMTP_FROM ?? "you@yourdomain.com";

// ─── sendWelcomeEmail ─────────────────────────────────────────────────────────
export async function sendWelcomeEmail({ to, name }: { to: string; name: string }) {
    await transporter.sendMail({
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
export async function sendPasswordResetEmail({ to, resetUrl }: { to: string; resetUrl: string }) {
    await transporter.sendMail({
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