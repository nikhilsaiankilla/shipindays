import { Resend } from "resend";
import { EmailProvider } from "@shipindays/email";

const resend = new Resend(process.env.RESEND_API_KEY);

export class ResendProvider implements EmailProvider {
  async sendEmail(data: {
    to: string | string[];
    subject: string;
    html: string;
  }): Promise<void> {
    await resend.emails.send({
      from: "ShipInDays <onboarding@resend.dev>",
      to: data.to,
      subject: data.subject,
      html: data.html,
    });
  }
}
