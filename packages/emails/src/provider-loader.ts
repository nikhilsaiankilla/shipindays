import { ResendProvider } from "@shipindays/resend";
import { MailgunProvider } from "@shipindays/mailgun";
import { EmailProvider } from "./email.interface";

export function loadEmailProvider(): EmailProvider {
  const provider = process.env.EMAIL_PROVIDER;

  switch (provider) {
    case "resend":
      return new ResendProvider();

    case "mailgun":
      return new MailgunProvider();

    default:
      throw new Error("Unsupported email provider");
  }
}
