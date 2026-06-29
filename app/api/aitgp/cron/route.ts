import { NextResponse } from "next/server";
import { refreshAitgpPrices } from "@/lib/aitgp-prices";

function isAuthorized(request: Request): boolean {
  const secret = process.env.AITGP_CRON_SECRET;
  if (!secret) return false;

  const bearer = request.headers.get("authorization");
  if (bearer === `Bearer ${secret}`) return true;

  return request.headers.get("x-cron-secret") === secret;
}

async function handleCron() {
  if (!process.env.AITGP_CRON_SECRET) {
    return NextResponse.json({ error: "AITGP_CRON_SECRET not configured" }, { status: 503 });
  }

  try {
    const snapshot = await refreshAitgpPrices();
    return NextResponse.json({
      ok: true,
      updatedAt: snapshot.updatedAt,
      symbolCount: Object.keys(snapshot.prices).length,
      unsupported: snapshot.unsupported,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "price refresh failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  return handleCron();
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  return handleCron();
}
