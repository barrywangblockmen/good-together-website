import { NextResponse } from "next/server";
import { AITGP_PRICE_TTL_SECONDS, getAitgpPrices } from "@/lib/aitgp-prices";
import { RESEARCH_PRICE_SYMBOLS } from "@/lib/research-gp";

export async function GET() {
  try {
    const snapshot = await getAitgpPrices();
    const prices = Object.fromEntries(
      RESEARCH_PRICE_SYMBOLS.flatMap((symbol) =>
        typeof snapshot.prices[symbol] === "number" ? [[symbol, snapshot.prices[symbol]]] : [],
      ),
    );
    return NextResponse.json(
      {
        prices,
        updatedAt: snapshot.updatedAt,
        unsupported: RESEARCH_PRICE_SYMBOLS.filter((symbol) => prices[symbol] == null),
      },
      {
        headers: {
          "Cache-Control": `public, s-maxage=${AITGP_PRICE_TTL_SECONDS}, stale-while-revalidate=60`,
        },
      },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "price fetch failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
