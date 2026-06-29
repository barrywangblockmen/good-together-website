import { unstable_cache } from "next/cache";
import { appendHourlySnapshots } from "@/lib/aitgp-snapshots-server";
import { AITGP_PRICE_TTL_SECONDS, type AitgpPriceSnapshot } from "@/lib/aitgp-chart";
import { getAllEntrySymbols } from "@/lib/aitgp";

export { AITGP_PRICE_TTL_SECONDS, type AitgpPriceSnapshot } from "@/lib/aitgp-chart";

export type AitgpPriceQuote = {
  symbol: string;
  price: number;
  source: "binance-futures" | "twse";
};
const TWSE_OTC = new Set(["8255", "5536"]);

/** 暫不支援自動報價 */
const UNSUPPORTED = new Set(["MTX", "07w1 44500P"]);

function isTwStock(symbol: string): boolean {
  return /^\d{4}$/.test(symbol);
}

function twseChannel(symbol: string): "tse" | "otc" {
  return TWSE_OTC.has(symbol) ? "otc" : "tse";
}

function twseExCh(symbol: string): string {
  const ch = twseChannel(symbol);
  return `${ch}_${symbol}.tw`;
}

type TwseRow = { c?: string; z?: string; y?: string };

function parseTwsePrice(row: TwseRow): number | undefined {
  const z = row.z?.replace(/,/g, "");
  if (z && z !== "-" && z !== "0.0000") {
    const n = Number(z);
    if (Number.isFinite(n) && n > 0) return n;
  }
  const y = row.y?.replace(/,/g, "");
  if (y) {
    const n = Number(y);
    if (Number.isFinite(n) && n > 0) return n;
  }
  return undefined;
}

function toBinanceFuturesSymbol(symbol: string): string {
  return symbol.endsWith("USDT") ? symbol : `${symbol}USDT`;
}

async function fetchBinanceFuturesPrices(symbols: string[]): Promise<AitgpPriceQuote[]> {
  if (symbols.length === 0) return [];

  const res = await fetch("https://fapi.binance.com/fapi/v1/ticker/price", {
    next: { revalidate: AITGP_PRICE_TTL_SECONDS },
  });
  if (!res.ok) throw new Error(`Binance futures HTTP ${res.status}`);

  const rows = (await res.json()) as { symbol: string; price: string }[];
  const need = new Set(symbols.map(toBinanceFuturesSymbol));
  const out: AitgpPriceQuote[] = [];

  for (const row of rows) {
    if (!need.has(row.symbol)) continue;
    const entrySymbol = symbols.find((s) => toBinanceFuturesSymbol(s) === row.symbol);
    if (!entrySymbol) continue;
    const price = Number(row.price);
    if (!Number.isFinite(price)) continue;
    out.push({ symbol: entrySymbol, price, source: "binance-futures" });
  }

  return out;
}

async function fetchTwsePrices(symbols: string[]): Promise<AitgpPriceQuote[]> {
  if (symbols.length === 0) return [];

  const exCh = symbols.map(twseExCh).join("|");
  const res = await fetch(
    `https://mis.twse.com.tw/stock/api/getStockInfo.jsp?ex_ch=${encodeURIComponent(exCh)}`,
    {
      headers: { Accept: "application/json" },
      next: { revalidate: AITGP_PRICE_TTL_SECONDS },
    },
  );
  if (!res.ok) throw new Error(`TWSE MIS HTTP ${res.status}`);

  const data = (await res.json()) as { msgArray?: TwseRow[] };
  const out: AitgpPriceQuote[] = [];

  for (const row of data.msgArray ?? []) {
    const code = row.c;
    if (!code || !symbols.includes(code)) continue;
    const price = parseTwsePrice(row);
    if (price == null) continue;
    out.push({ symbol: code, price, source: "twse" });
  }

  return out;
}

async function fetchAitgpPricesUncached(): Promise<AitgpPriceSnapshot> {
  const allSymbols = getAllEntrySymbols();
  const unsupported = allSymbols.filter((s) => UNSUPPORTED.has(s));
  const tracked = allSymbols.filter((s) => !UNSUPPORTED.has(s));

  const twSymbols = tracked.filter(isTwStock);
  const binanceSymbols = tracked.filter((s) => !isTwStock(s));

  const [binanceQuotes, twseQuotes] = await Promise.all([
    fetchBinanceFuturesPrices(binanceSymbols),
    fetchTwsePrices(twSymbols),
  ]);

  const prices: Record<string, number> = {};
  for (const q of [...binanceQuotes, ...twseQuotes]) {
    prices[q.symbol] = q.price;
  }

  const chartHistory = await appendHourlySnapshots(prices);

  return {
    prices,
    updatedAt: new Date().toISOString(),
    unsupported,
    chartHistory,
  };
}

export const getAitgpPrices = unstable_cache(
  fetchAitgpPricesUncached,
  ["aitgp-live-prices"],
  { revalidate: AITGP_PRICE_TTL_SECONDS },
);
