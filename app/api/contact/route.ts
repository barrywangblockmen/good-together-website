import { NextResponse } from "next/server";
import { contactBodySchema } from "@/lib/schemas/contact";
import { NOTIFY_EMAIL } from "@/lib/constants";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { enqueueMail } from "@/lib/mail-queue";
import { formatTaipeiTime, sendMail } from "@/lib/mail";
import { appendSubmission } from "@/lib/submission-log";

export const runtime = "nodejs";

const WINDOW_MS = 15 * 60 * 1000;
const MAX_CONTACT = 5;

type UnknownBody = {
  name?: unknown;
  email?: unknown;
  phone?: unknown;
  message?: unknown;
  consent?: unknown;
  website?: unknown;
};

export async function POST(request: Request) {
  let json: UnknownBody;
  try {
    json = (await request.json()) as UnknownBody;
  } catch {
    return NextResponse.json(
      { ok: false, error: "VALIDATION_ERROR", details: ["body"] },
      { status: 400 }
    );
  }

  const honeypot =
    typeof json.website === "string" && json.website.trim() !== "";
  if (honeypot) {
    return new NextResponse(null, { status: 204 });
  }

  const ip = getClientIp(request.headers);
  const rl = checkRateLimit(`contact:${ip}`, MAX_CONTACT, WINDOW_MS);
  if (!rl.ok) {
    return NextResponse.json(
      { ok: false, error: "RATE_LIMIT" },
      {
        status: 429,
        headers: { "Retry-After": String(Math.ceil(rl.retryAfterMs / 1000)) },
      }
    );
  }

  const raw = {
    name: json.name,
    email: json.email,
    phone: json.phone,
    message: json.message,
    consent: json.consent,
  };

  const parsed = contactBodySchema.safeParse(raw);
  if (!parsed.success) {
    const details = parsed.error.issues.map((i) => i.path.join(".") || "field");
    return NextResponse.json(
      { ok: false, error: "VALIDATION_ERROR", details },
      { status: 400 }
    );
  }

  const data = parsed.data;
  const userAgent = (request.headers.get("user-agent") || "").slice(0, 512);
  const referrer = (request.headers.get("referer") || "").slice(0, 2048);
  const createdAt = new Date().toISOString();

  try {
    await appendSubmission({
      createdAt,
      name: data.name,
      email: data.email,
      phone: data.phone,
      message: data.message,
      consent: true,
      ip,
      userAgent,
      referrer,
    });
  } catch {
    return NextResponse.json({ ok: false, error: "SERVER_ERROR" }, { status: 500 });
  }

  const notifyTo = process.env.NOTIFY_EMAIL || NOTIFY_EMAIL;
  const from = process.env.FROM_EMAIL;
  if (!from) {
    return NextResponse.json(
      { ok: false, error: "SERVER_ERROR" },
      { status: 500 }
    );
  }

  const html = `
  <h1>新的加入意向</h1>
  <p><strong>時間（台北）</strong>：${formatTaipeiTime()}</p>
  <p><strong>姓名</strong>：${escapeHtml(data.name)}</p>
  <p><strong>Email</strong>：${escapeHtml(data.email)}</p>
  <p><strong>電話</strong>：${data.phone ? escapeHtml(data.phone) : "（未填）"}</p>
  <p><strong>意願說明</strong>：</p>
  <pre style="white-space:pre-wrap;font-family:inherit">${escapeHtml(data.message)}</pre>
  `;

  try {
    await enqueueMail(() =>
      sendMail({
        from,
        to: notifyTo,
        subject: `[GT協會] 新的加入意向：${data.name}`,
        html,
        replyTo: data.email,
      })
    );
  } catch {
    return NextResponse.json({ ok: false, error: "SERVER_ERROR" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

function escapeHtml(s: string) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
