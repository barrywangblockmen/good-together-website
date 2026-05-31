import { Resend } from "resend";
import nodemailer from "nodemailer";

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

function getSmtpTransporter() {
  const host = process.env.SMTP_HOST;
  const portRaw = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) return null;

  const port = Number(portRaw || "465");
  const secure =
    process.env.SMTP_SECURE !== undefined
      ? process.env.SMTP_SECURE === "true"
      : port === 465;

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });
}

function shouldUseResend(from: string): boolean {
  const provider = process.env.MAIL_PROVIDER?.toLowerCase();
  if (provider === "resend") return true;
  if (provider === "smtp") return false;
  // Verified-domain senders (e.g. newsletter@gtclub.tw) must use Resend, not Gmail SMTP.
  return /@gtclub\.tw>\s*$|@gtclub\.tw$/i.test(from);
}

export async function sendMail(input: SendMailInput): Promise<void> {
  const resend = getResend();
  const smtp = getSmtpTransporter();

  if (shouldUseResend(input.from) && resend) {
    const { data, error } = await resend.emails.send({
      from: input.from,
      to: input.to,
      subject: input.subject,
      html: input.html,
      replyTo: input.replyTo,
    });
    if (error || !data) {
      throw new Error(error.message || "Resend error");
    }
    return;
  }

  if (smtp) {
    await smtp.sendMail({
      from: input.from,
      to: input.to,
      subject: input.subject,
      html: input.html,
      replyTo: input.replyTo,
    });
    return;
  }

  if (resend) {
    const { data, error } = await resend.emails.send({
      from: input.from,
      to: input.to,
      subject: input.subject,
      html: input.html,
      replyTo: input.replyTo,
    });
    if (error || !data) {
      throw new Error(error.message || "Resend error");
    }
    return;
  }

  throw new Error("SMTP and RESEND are both not configured");
}

export function formatTaipeiTime(date = new Date()) {
  return date.toLocaleString("zh-TW", {
    timeZone: "Asia/Taipei",
    dateStyle: "medium",
    timeStyle: "medium",
  });
}
