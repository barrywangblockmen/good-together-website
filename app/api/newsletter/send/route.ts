import { NextResponse } from "next/server";
import { sendMail } from "@/lib/mail";
import { enqueueMail } from "@/lib/mail-queue";
import { sendBodySchema } from "@/lib/schemas/newsletter";
import { listActiveSubscribers } from "@/lib/subscriber-log";

export const runtime = "nodejs";

function getSiteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
}

function verifyBearer(request: Request): boolean {
  const secret = process.env.NEWSLETTER_API_SECRET;
  if (!secret) return false;

  const auth = request.headers.get("authorization") || "";
  const match = auth.match(/^Bearer\s+(.+)$/i);
  if (!match) return false;

  return match[1] === secret;
}

function buildUnsubscribeFooter(token: string) {
  const url = `${getSiteUrl()}/api/newsletter/unsubscribe?token=${encodeURIComponent(token)}`;
  return `
  <hr style="border:none;border-top:1px solid #e5e7eb;margin:32px 0 16px" />
  <p style="font-size:12px;color:#6b7280;line-height:1.6">
    您收到此信是因為曾訂閱台灣共好交流協會電子報。
    若不想再收到，請<a href="${url}">按此退訂</a>。
  </p>`;
}

export async function POST(request: Request) {
  if (!verifyBearer(request)) {
    return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "VALIDATION_ERROR", details: ["body"] },
      { status: 400 }
    );
  }

  const parsed = sendBodySchema.safeParse(json);
  if (!parsed.success) {
    const details = parsed.error.issues.map((i) => i.path.join(".") || "field");
    return NextResponse.json(
      { ok: false, error: "VALIDATION_ERROR", details },
      { status: 400 }
    );
  }

  const { subject, html, dryRun } = parsed.data;
  const from = process.env.FROM_EMAIL;
  if (!from) {
    return NextResponse.json({ ok: false, error: "SERVER_ERROR" }, { status: 500 });
  }

  let subscribers;
  try {
    subscribers = await listActiveSubscribers();
  } catch {
    return NextResponse.json({ ok: false, error: "SERVER_ERROR" }, { status: 500 });
  }

  if (dryRun) {
    return NextResponse.json({ ok: true, count: subscribers.length });
  }

  let sent = 0;
  let failed = 0;

  for (const subscriber of subscribers) {
    const bodyHtml = `${html}${buildUnsubscribeFooter(subscriber.unsubscribeToken)}`;
    try {
      await enqueueMail(() =>
        sendMail({
          from,
          to: subscriber.email,
          subject,
          html: bodyHtml,
        })
      );
      sent += 1;
    } catch {
      failed += 1;
    }
  }

  return NextResponse.json({
    ok: true,
    sent,
    failed,
    total: subscribers.length,
  });
}
