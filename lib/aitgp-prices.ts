import {
  appendHourlySnapshots,
  readLatestPrices,
  readManualPrices,
  readSnapshots,
  writeLatestPrices,
  type AitgpLatestPrices,
} from "@/lib/aitgp-snapshots-server";
import { collectTaifexTargets, fetchTaifexPrices } from "@/lib/aitgp-taifex";
import { AITGP_PRICE_TTL_SECONDS, type AitgpPriceSnapshot } from "@/lib/aitgp-chart";
import { getAllEntrySymbols } from "@/lib/aitgp";

export { AITGP_PRICE_TTL_SECONDS, type AitgpPriceSnapshot } from "@/lib/aitgp-chart";

export type AitgpPriceQuote = {
  symbol: string;
  price: number;
  source: "binance-futures" | "twse" | "taifex";
};

const TWSE_OTC = new Set(["8255", "5536"]);

let refreshPromise: Promise<AitgpPriceSnapshot> | null = null;

function isWithinTtl(updatedAt: string): boolean {
  const ageMs = Date.now() - new Date(updatedAt).getTime();
  return ageMs >= 0 && ageMs < AITGP_PRICE_TTL_SECONDS * 1000;
}

function isTwStock(symbol: string): boolean {
  return /^\d{4}$/.test(symbol);
}

function isTaifexSymbol(symbol: string): boolean {
  return symbol === "MTX" || /^\d{2}w\d\s+\d+[PC]$/i.test(symbol);
}

function twseChannel(symbol: string): "tse" | "otc" {
  return TWSE_OTC.has(symbol) ? "otc" : "tse";
}

function twseExCh(symbol: string): string {
  const ch = twseChannel(symbol);
  return `${ch}_${symbol}.tw`;
}

type TwseRow = { c?: string; z?: string; y?: string; a?: string; b?: string };

function parseLadderTop(ladder?: string): number | undefined {
  if (!ladder) return undefined;
  const top = ladder.split("_")[0]?.replace(/,/g, "");
  if (!top || top === "-") return undefined;
  const n = Number(top);
  return Number.isFinite(n) && n > 0 ? n : undefined;
}

function parseTwsePrice(row: TwseRow): number | undefined {
  const z = row.z?.replace(/,/g, "");
  if (z && z !== "-" && z !== "0.0000") {
    const n = Number(z);
    if (Number.isFinite(n) && n > 0) return n;
  }

  // MIS 盤中常回 z=-，改以最佳買賣價中間價估算
  const ask = parseLadderTop(row.a);
  const bid = parseLadderTop(row.b);
  if (ask != null && bid != null) return (ask + bid) / 2;
  if (ask != null) return ask;
  if (bid != null) return bid;

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
    cache: "no-store",
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
      headers: {
        Accept: "application/json",
        Referer: "https://mis.twse.com.tw/stock/index.jsp",
      },
      cache: "no-store",
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

async function fetchQuotes(): Promise<AitgpLatestPrices> {
  const allSymbols = getAllEntrySymbols();
  const tracked = allSymbols.filter((s) => !isTaifexSymbol(s));

  const twSymbols = tracked.filter(isTwStock);
  const binanceSymbols = tracked.filter((s) => !isTwStock(s));

  const [binanceQuotes, twseQuotes, taifexPrices, manualPrices] = await Promise.all([
    fetchBinanceFuturesPrices(binanceSymbols),
    fetchTwsePrices(twSymbols),
    fetchTaifexPrices(collectTaifexTargets()),
    readManualPrices(),
  ]);

  const prices: Record<string, number> = {};
  for (const q of [...binanceQuotes, ...twseQuotes]) {
    prices[q.symbol] = q.price;
  }
  for (const [symbol, price] of Object.entries(taifexPrices)) {
    prices[symbol] = price;
  }
  // 手動價僅在自動報價失敗時補位
  for (const [symbol, price] of Object.entries(manualPrices)) {
    if (prices[symbol] == null) prices[symbol] = price;
  }

  const unsupported = allSymbols.filter((s) => prices[s] == null);

  return {
    prices,
    updatedAt: new Date().toISOString(),
    unsupported,
  };
}

function toSnapshot(latest: AitgpLatestPrices, chartHistory: Awaited<ReturnType<typeof readSnapshots>>): AitgpPriceSnapshot {
  return {
    prices: latest.prices,
    updatedAt: latest.updatedAt,
    unsupported: latest.unsupported,
    chartHistory,
  };
}

/** 向交易所拉最新價、寫入磁碟並追加每小時快照（cron 與 fallback 共用） */
export async function refreshAitgpPrices(): Promise<AitgpPriceSnapshot> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    const latest = await fetchQuotes();
    await writeLatestPrices(latest);
    const chartHistory = await appendHourlySnapshots(latest.prices);
    return toSnapshot(latest, chartHistory);
  })().finally(() => {
    refreshPromise = null;
  });

  return refreshPromise;
}

/** 讀取已持久化的行情；過期時才 fallback 重新抓取 */
export async function getAitgpPrices(): Promise<AitgpPriceSnapshot> {
  const [latest, chartHistory] = await Promise.all([readLatestPrices(), readSnapshots()]);

  if (latest && isWithinTtl(latest.updatedAt)) {
    return toSnapshot(latest, chartHistory);
  }

  return refreshAitgpPrices();
}
