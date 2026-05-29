import { NextResponse } from "next/server";
import { NOTIFY_EMAIL } from "@/lib/constants";
import { getNewsletterTopicLabel } from "@/lib/newsletter-topics";
import { formatTaipeiTime, sendMail } from "@/lib/mail";
import { enqueueMail } from "@/lib/mail-queue";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { subscribeBodySchema } from "@/lib/schemas/newsletter";
import { appendSubscriber } from "@/lib/subscriber-log";

export const runtime = "nodejs";

const WINDOW_MS = 15 * 60 * 1000;
const MAX_SUBSCRIBE = 5;

type UnknownBody = {
  email?: unknown;
  name?: unknown;
  topics?: unknown;
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
  const rl = checkRateLimit(`newsletter:${ip}`, MAX_SUBSCRIBE, WINDOW_MS);
  if (!rl.ok) {
    return NextResponse.json(
      { ok: false, error: "RATE_LIMIT" },
      {
        status: 429,
        headers: { "Retry-After": String(Math.ceil(rl.retryAfterMs / 1000)) },
      }
    );
  }

  const parsed = subscribeBodySchema.safeParse({
    email: json.email,
    name: json.name,
    topics: json.topics,
    consent: json.consent,
  });
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

  let already = false;
  let addedTopics = data.topics;
  try {
    const result = await appendSubscriber({
      email: data.email,
      name: data.name,
      topics: data.topics,
      consent: true,
      ip,
      userAgent,
      referrer,
    });
    already = result.already;
    addedTopics = result.addedTopics;
  } catch {
    return NextResponse.json({ ok: false, error: "SERVER_ERROR" }, { status: 500 });
  }

  if (!already) {
    const notifyTo = process.env.NOTIFY_EMAIL || NOTIFY_EMAIL;
    const from = process.env.FROM_EMAIL;
    if (from) {
      const topicLabels = data.topics.map((id) => getNewsletterTopicLabel(id)).join("、");
      const html = `
      <h1>新的電子報訂閱</h1>
      <p><strong>時間（台北）</strong>：${formatTaipeiTime()}</p>
      <p><strong>Email</strong>：${escapeHtml(data.email)}</p>
      <p><strong>姓名</strong>：${data.name ? escapeHtml(data.name) : "（未填）"}</p>
      <p><strong>訂閱主題</strong>：${escapeHtml(topicLabels)}</p>
      `;
      try {
        await enqueueMail(() =>
          sendMail({
            from,
            to: notifyTo,
            subject: `[GT協會] 新的電子報訂閱：${data.email}`,
            html,
            replyTo: data.email,
          })
        );
      } catch {
        // Subscription is saved; notification failure should not block the user.
      }
    }
  }

  return NextResponse.json({ ok: true, already, addedTopics });
}

function escapeHtml(s: string) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
