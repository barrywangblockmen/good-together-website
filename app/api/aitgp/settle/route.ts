import { NextResponse } from "next/server";
import { refreshAitgpPrices } from "@/lib/aitgp-prices";
import {
  listRoundsNeedingNonTwSettle,
  readSettlements,
  settleOpenNonTwLegs,
} from "@/lib/aitgp-settlements-server";

function isAuthorized(request: Request): boolean {
  const secret = process.env.AITGP_CRON_SECRET;
  if (!secret) return false;

  const bearer = request.headers.get("authorization");
  if (bearer === `Bearer ${secret}`) return true;

  return request.headers.get("x-cron-secret") === secret;
}

async function handleSettle(request: Request) {
  if (!process.env.AITGP_CRON_SECRET) {
    return NextResponse.json({ error: "AITGP_CRON_SECRET not configured" }, { status: 503 });
  }

  try {
    const url = new URL(request.url);
    const roundIdParam = url.searchParams.get("roundId");
    const snapshot = await refreshAitgpPrices();
    const store = await readSettlements();
    const roundIds = roundIdParam
      ? [roundIdParam]
      : listRoundsNeedingNonTwSettle(store);

    if (roundIds.length === 0) {
      return NextResponse.json({
        ok: true,
        message: "no open non-TW legs to settle",
        settledExits: snapshot.settledExits ?? {},
      });
    }

    const results = [];
    for (const roundId of roundIds) {
      const result = await settleOpenNonTwLegs(
        roundId,
        snapshot.prices,
        "美股收盤後自動結算非台股標的（加密／美股代幣）",
      );
      results.push({
        roundId: result.roundId,
        locked: result.locked,
        missing: result.missing,
        status: result.status,
      });
    }

    const refreshed = await refreshAitgpPrices();
    return NextResponse.json({
      ok: true,
      updatedAt: refreshed.updatedAt,
      results,
      settledExits: refreshed.settledExits ?? {},
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "settle failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  return handleSettle(request);
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  return handleSettle(request);
}
