// Mailgun client setup
import formData from "form-data";
import Mailgun from "mailgun.js";

const mailgun = new Mailgun(formData);

// initialize Mailgun client with API key
const mg = mailgun.client({
    username: "api",
    key: process.env.MAILGUN_API_KEY || "",
});

// domain + sender config (fallback used if env missing)
const DOMAIN = process.env.MAILGUN_DOMAIN || "yourdomain.com";
const FROM = `You <hello@${DOMAIN}>`;


// send welcome email after user signup
export async function sendWelcomeEmail({
    to,
    name,
}: {
    to: string;
    name: string;
}) {
    await mg.messages.create(DOMAIN, {
        from: FROM,
        to: [to],
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


// send password reset email with secure link
export async function sendPasswordResetEmail({
    to,
    resetUrl,
}: {
    to: string;
    resetUrl: string;
}) {
    await mg.messages.create(DOMAIN, {
        from: FROM,
        to: [to],
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