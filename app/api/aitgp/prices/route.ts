import { NextResponse } from "next/server";
import { AITGP_PRICE_TTL_SECONDS, getAitgpPrices } from "@/lib/aitgp-prices";

export async function GET() {
  try {
    const snapshot = await getAitgpPrices();
    return NextResponse.json(snapshot, {
      headers: {
        "Cache-Control": `public, s-maxage=${AITGP_PRICE_TTL_SECONDS}, stale-while-revalidate=60`,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "price fetch failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
