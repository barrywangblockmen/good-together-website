import { NextResponse } from "next/server";
import { visitSchema } from "@/lib/schemas/visit";
import { NOTIFY_EMAIL } from "@/lib/constants";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { enqueueMail } from "@/lib/mail-queue";
import { formatTaipeiTime, sendMail } from "@/lib/mail";
import { getGeoLabel, isLikelyBot, resolveGeoLabel } from "@/lib/traffic-intel";

export const runtime = "nodejs";

const WINDOW_MS = 60 * 1000;
const MAX_VISIT = 120;

export async function POST(request: Request) {
  const enabled = process.env.VISIT_NOTIFY_ENABLED !== "false";
  if (!enabled) {
    return new NextResponse(null, { status: 204 });
  }
  const debugIpHeaders = process.env.VISIT_DEBUG_IP_HEADERS === "true";

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "VALIDATION_ERROR" },
      { status: 400 }
    );
  }

  const parsed = visitSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "VALIDATION_ERROR" },
      { status: 400 }
    );
  }

  if (debugIpHeaders) {
    console.info(
      "[visit-debug] ip headers",
      JSON.stringify({
        "cf-connecting-ip": request.headers.get("cf-connecting-ip"),
        "x-vercel-forwarded-for": request.headers.get("x-vercel-forwarded-for"),
        "x-forwarded-for": request.headers.get("x-forwarded-for"),
        "x-real-ip": request.headers.get("x-real-ip"),
        "true-client-ip": request.headers.get("true-client-ip"),
        "x-client-ip": request.headers.get("x-client-ip"),
        "forwarded": request.headers.get("forwarded"),
        host: request.headers.get("host"),
      })
    );
  }

  const ip = getClientIp(request.headers);
  const rl = checkRateLimit(`visit:${ip}`, MAX_VISIT, WINDOW_MS);
  if (!rl.ok) {
    return new NextResponse(null, { status: 429 });
  }

  const ua = (request.headers.get("user-agent") || "").slice(0, 512);
  let geo = getGeoLabel(ip);
  if (geo === "待查詢") {
    geo = await resolveGeoLabel(ip);
  }
  const bot = isLikelyBot(ua);
  const data = parsed.data;
  const notifyTo = process.env.NOTIFY_EMAIL || NOTIFY_EMAIL;
  const from = process.env.FROM_EMAIL;
  if (!from) {
    return new NextResponse(null, { status: 204 });
  }

  const html = `
  <h1>網站造訪</h1>
  <p><strong>時間（台北）</strong>：${formatTaipeiTime()}</p>
  <p><strong>路徑</strong>：${escapeHtml(data.path)}</p>
  <p><strong>Referrer</strong>：${data.referrer ? escapeHtml(data.referrer) : "（無）"}</p>
  <p><strong>標題</strong>：${data.title ? escapeHtml(data.title) : "（無）"}</p>
  <p><strong>IP</strong>：${escapeHtml(ip)}</p>
  <p><strong>大概位置</strong>：${escapeHtml(geo)}</p>
  <p><strong>流量判定</strong>：${bot ? "疑似機器人" : "一般使用者（推測）"}</p>
  <p><strong>User-Agent</strong>：</p>
  <pre style="white-space:pre-wrap;font-family:inherit">${escapeHtml(ua)}</pre>
  `;

  try {
    await enqueueMail(() =>
      sendMail({
        from,
        to: notifyTo,
        subject: `[GT協會] ${ip} ${geo}`,
        html,
      })
    );
  } catch {
    return NextResponse.json({ ok: false, error: "SERVER_ERROR" }, { status: 500 });
  }

  return new NextResponse(null, { status: 204 });
}

function escapeHtml(s: string) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
