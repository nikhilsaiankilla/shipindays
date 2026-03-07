export interface EmailProvider {
  sendEmail(data: {
    to: string | string[];
    subject: string;
    html: string;
  }): Promise<void>;
}
