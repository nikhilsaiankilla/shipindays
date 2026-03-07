import { loadEmailProvider } from "./provider-loader";
import { EmailProvider } from "./email.interface";

const provider: EmailProvider = loadEmailProvider();

export const EmailService = {
  sendEmail(data: { to: string; subject: string; html: string }) {
    return provider.sendEmail(data);
  },
};
