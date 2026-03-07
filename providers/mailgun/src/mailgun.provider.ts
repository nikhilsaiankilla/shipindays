import Mailgun from "mailgun.js";
import formData from "form-data";
import { EmailProvider } from "@shipindays/email";

const mailgun = new Mailgun(formData);

const mg = mailgun.client({
  username: "api",
  key: process.env.MAILGUN_API_KEY!,
});

export class MailgunProvider implements EmailProvider {
  async sendEmail(data: {
    to: string | string[];
    subject: string;
    html: string;
  }): Promise<void> {
    await mg.messages.create(process.env.MAILGUN_DOMAIN!, {
      from: `ShipInDays <mail@${process.env.MAILGUN_DOMAIN}>`,
      to: data.to,
      subject: data.subject,
      html: data.html,
    });
  }
}
