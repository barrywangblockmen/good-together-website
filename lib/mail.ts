import { Resend } from "resend";

export type SendMailInput = {
  to: string;
  from: string;
  subject: string;
  html: string;
  replyTo?: string;
};

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

export async function sendMail(input: SendMailInput): Promise<void> {
  const resend = getResend();
  if (!resend) {
    throw new Error("RESEND_API_KEY is not configured");
  }
  const { error } = await resend.emails.send({
    from: input.from,
    to: input.to,
    subject: input.subject,
    html: input.html,
    replyTo: input.replyTo,
  });
  if (error) {
    throw new Error(error.message || "Resend error");
  }
}

export function formatTaipeiTime(date = new Date()) {
  return date.toLocaleString("zh-TW", {
    timeZone: "Asia/Taipei",
    dateStyle: "medium",
    timeStyle: "medium",
  });
}
