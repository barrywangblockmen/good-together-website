import { NextResponse } from "next/server";
import { createLoginToken } from "@/lib/auth-token";
import { enqueueMail } from "@/lib/mail-queue";
import { sendMail } from "@/lib/mail";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { loginBodySchema } from "@/lib/schemas/auth";
import { getPublicSiteUrl } from "@/lib/site-url";
import { findByEmail } from "@/lib/whitelist-log";

export const runtime = "nodejs";

const WINDOW_MS = 15 * 60 * 1000;
const MAX_LOGIN = 5;

type UnknownBody = {
  email?: unknown;
  website?: unknown;
  next?: unknown;
};

function sanitizeNext(next: unknown): string {
  if (typeof next !== "string") return "/";
  const value = next.trim();
  if (!value.startsWith("/") || value.startsWith("//")) return "/";
  return value;
}

function escapeHtml(s: string) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

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
  const rl = checkRateLimit(`auth-login:${ip}`, MAX_LOGIN, WINDOW_MS);
  if (!rl.ok) {
    return NextResponse.json(
      { ok: false, error: "RATE_LIMIT" },
      {
        status: 429,
        headers: { "Retry-After": String(Math.ceil(rl.retryAfterMs / 1000)) },
      }
    );
  }

  const parsed = loginBodySchema.safeParse({ email: json.email });
  if (!parsed.success) {
    const details = parsed.error.issues.map((i) => i.path.join(".") || "field");
    return NextResponse.json(
      { ok: false, error: "VALIDATION_ERROR", details },
      { status: 400 }
    );
  }

  const email = parsed.data.email.trim().toLowerCase();
  const nextPath = sanitizeNext(json.next);

  // Always return the same success message (do not leak whitelist membership).
  const success = NextResponse.json({ ok: true });

  let record;
  try {
    record = await findByEmail(email);
  } catch {
    return NextResponse.json({ ok: false, error: "SERVER_ERROR" }, { status: 500 });
  }

  if (!record) {
    return success;
  }

  const from = process.env.FROM_EMAIL;
  if (!from) {
    return NextResponse.json({ ok: false, error: "SERVER_ERROR" }, { status: 500 });
  }

  let token: string;
  try {
    token = await createLoginToken(email);
  } catch {
    return NextResponse.json({ ok: false, error: "SERVER_ERROR" }, { status: 500 });
  }

  const siteUrl = getPublicSiteUrl(request);
  const verifyUrl = new URL("/auth/verify", siteUrl);
  verifyUrl.searchParams.set("token", token);
  verifyUrl.searchParams.set("next", nextPath);

  const html = `
  <h1>GT 俱樂部 — 登入連結</h1>
  <p>您好，請點擊下方連結完成登入（15 分鐘內有效，僅能使用一次）：</p>
  <p><a href="${escapeHtml(verifyUrl.toString())}">點此登入</a></p>
  <p style="color:#666;font-size:14px;">若您沒有申請登入，請忽略此信。</p>
  `;

  try {
    await enqueueMail(() =>
      sendMail({
        from,
        to: email,
        subject: "GT 俱樂部 — 登入連結",
        html,
      })
    );
  } catch {
    return NextResponse.json({ ok: false, error: "SERVER_ERROR" }, { status: 500 });
  }

  return success;
}
