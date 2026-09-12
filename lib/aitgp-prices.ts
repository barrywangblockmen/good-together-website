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
import { getAllEntrySymbols, isTwStockSymbol } from "@/lib/aitgp";
import { getSettledExitsByRound } from "@/lib/aitgp-settlements-server";

export { AITGP_PRICE_TTL_SECONDS, type AitgpPriceSnapshot } from "@/lib/aitgp-chart";

export type AitgpPriceQuote = {
  symbol: string;
  price: number;
  source: "binance-futures" | "twse" | "taifex" | "us-stock";
};

const TWSE_OTC = new Set(["8255", "5536", "4991", "6620", "8027", "3374", "5274", "6913", "6510"]);

/** Binance 合約代號與實際標的不符時排除（例：SUSDT 為加密幣，非 NYSE SentinelOne） */
const BINANCE_EXCLUDED = new Set(["S"]);

/** 美股代號 → Yahoo Finance ticker */
const US_STOCK_TICKERS: Record<string, string> = {
  S: "S",
};

/** Binance 合約代號與進場價單位不一致時需換算（例：1000PEPEUSDT → PEPE 現價 ÷ 1000） */
const BINANCE_FUTURES_ALIASES: Record<string, { symbol: string; scale: number }> = {
  PEPE: { symbol: "1000PEPEUSDT", scale: 1000 },
};

let refreshPromise: Promise<AitgpPriceSnapshot> | null = null;

function isWithinTtl(updatedAt: string): boolean {
  const ageMs = Date.now() - new Date(updatedAt).getTime();
  return ageMs >= 0 && ageMs < AITGP_PRICE_TTL_SECONDS * 1000;
}

function isTwStock(symbol: string): boolean {
  return isTwStockSymbol(symbol);
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

type TwseRow = {
  c?: string;
  z?: string;
  y?: string;
  o?: string;
  u?: string;
  h?: string;
  a?: string;
  b?: string;
};

/** 取買賣五檔中第一個有效價（略過 - / 0，漲停時常出現 0.0000_漲停價_…） */
function parseLadderTop(ladder?: string): number | undefined {
  if (!ladder) return undefined;
  for (const part of ladder.split("_")) {
    const top = part?.replace(/,/g, "");
    if (!top || top === "-") continue;
    const n = Number(top);
    if (Number.isFinite(n) && n > 0) return n;
  }
  return undefined;
}

function parsePositive(raw?: string): number | undefined {
  if (!raw) return undefined;
  const v = raw.replace(/,/g, "");
  if (!v || v === "-" || v === "0.0000") return undefined;
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : undefined;
}

function parseTwsePrice(row: TwseRow): number | undefined {
  const last = parsePositive(row.z);
  if (last != null) return last;

  // MIS 盤中常回 z=-，改以最佳買賣價中間價估算
  const ask = parseLadderTop(row.a);
  const bid = parseLadderTop(row.b);
  if (ask != null && bid != null) return (ask + bid) / 2;
  if (ask != null) return ask;
  if (bid != null) return bid;

  // 漲停／無五檔時：優先今開、漲停價、最高，最後才用昨收（避免整日卡在 y）
  return (
    parsePositive(row.o) ??
    parsePositive(row.u) ??
    parsePositive(row.h) ??
    parsePositive(row.y)
  );
}

function toBinanceFuturesSymbol(symbol: string): string {
  const alias = BINANCE_FUTURES_ALIASES[symbol];
  if (alias) return alias.symbol;
  return symbol.endsWith("USDT") ? symbol : `${symbol}USDT`;
}

function fromBinanceFuturesSymbol(futuresSymbol: string, entrySymbol: string): number | undefined {
  const alias = BINANCE_FUTURES_ALIASES[entrySymbol];
  if (alias && futuresSymbol === alias.symbol) return alias.scale;
  return 1;
}

async function fetchUsStockPrices(symbols: string[]): Promise<AitgpPriceQuote[]> {
  if (symbols.length === 0) return [];

  const out: AitgpPriceQuote[] = [];
  await Promise.all(
    symbols.map(async (symbol) => {
      try {
        const ticker = US_STOCK_TICKERS[symbol];
        if (!ticker) return;
        const res = await fetch(
          `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?interval=1d&range=1d`,
          {
            headers: {
              Accept: "application/json",
              "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            },
            cache: "no-store",
          },
        );
        if (!res.ok) return;
        const data = (await res.json()) as {
          chart?: { result?: { meta?: { regularMarketPrice?: number } }[] };
        };
        const price = data.chart?.result?.[0]?.meta?.regularMarketPrice;
        if (typeof price !== "number" || !Number.isFinite(price)) return;
        out.push({ symbol, price, source: "us-stock" });
      } catch {
        // 單一美股失敗不阻斷整批
      }
    }),
  );
  return out;
}

async function fetchBinanceFuturesPrices(symbols: string[]): Promise<AitgpPriceQuote[]> {
  if (symbols.length === 0) return [];

  const filtered = symbols.filter((s) => !BINANCE_EXCLUDED.has(s));
  if (filtered.length === 0) return [];

  try {
    const res = await fetch("https://fapi.binance.com/fapi/v1/ticker/price", {
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`Binance futures HTTP ${res.status}`);

    const rows = (await res.json()) as { symbol: string; price: string }[];
    const need = new Set(filtered.map(toBinanceFuturesSymbol));
    const out: AitgpPriceQuote[] = [];

    for (const row of rows) {
      if (!need.has(row.symbol)) continue;
      const entrySymbol = filtered.find((s) => toBinanceFuturesSymbol(s) === row.symbol);
      if (!entrySymbol) continue;
      const scale = fromBinanceFuturesSymbol(row.symbol, entrySymbol) ?? 1;
      const price = Number(row.price) / scale;
      if (!Number.isFinite(price)) continue;
      out.push({ symbol: entrySymbol, price, source: "binance-futures" });
    }

    return out;
  } catch {
    return [];
  }
}

async function fetchTwseMisJson(exCh: string): Promise<{ msgArray?: TwseRow[] }> {
  // EC2 上 undici/fetch 對 MIS 常 ECONNRESET；改用 Node https（HTTP/1.1）較穩定
  const { get } = await import("node:https");
  const url = `https://mis.twse.com.tw/stock/api/getStockInfo.jsp?ex_ch=${encodeURIComponent(exCh)}`;

  return new Promise((resolve, reject) => {
    const req = get(
      url,
      {
        headers: {
          Accept: "application/json",
          Referer: "https://mis.twse.com.tw/stock/index.jsp",
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
        timeout: 12_000,
      },
      (res) => {
        let body = "";
        res.setEncoding("utf8");
        res.on("data", (chunk) => {
          body += chunk;
        });
        res.on("end", () => {
          if ((res.statusCode ?? 0) < 200 || (res.statusCode ?? 0) >= 300) {
            reject(new Error(`TWSE MIS HTTP ${res.statusCode}`));
            return;
          }
          try {
            resolve(JSON.parse(body.trim()) as { msgArray?: TwseRow[] });
          } catch (err) {
            reject(err);
          }
        });
      },
    );
    req.on("timeout", () => {
      req.destroy(new Error("TWSE MIS timeout"));
    });
    req.on("error", reject);
  });
}

async function fetchTwsePrices(symbols: string[]): Promise<AitgpPriceQuote[]> {
  if (symbols.length === 0) return [];

  const exCh = symbols.map(twseExCh).join("|");

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const data = await fetchTwseMisJson(exCh);
      const out: AitgpPriceQuote[] = [];

      for (const row of data.msgArray ?? []) {
        const code = row.c;
        if (!code || !symbols.includes(code)) continue;
        const price = parseTwsePrice(row);
        if (price == null) continue;
        out.push({ symbol: code, price, source: "twse" });
      }

      return out;
    } catch {
      if (attempt < 2) await new Promise((r) => setTimeout(r, 400 * (attempt + 1)));
    }
  }

  return [];
}

async function safeSource<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch {
    return fallback;
  }
}

async function fetchQuotes(): Promise<AitgpLatestPrices> {
  const allSymbols = getAllEntrySymbols();
  const tracked = allSymbols.filter((s) => !isTaifexSymbol(s));

  const twSymbols = tracked.filter(isTwStock);
  const usStockSymbols = tracked.filter((s) => US_STOCK_TICKERS[s] != null);
  const binanceSymbols = tracked.filter((s) => !isTwStock(s) && US_STOCK_TICKERS[s] == null);

  const [binanceQuotes, twseQuotes, usStockQuotes, taifexPrices, manualPrices, previous] =
    await Promise.all([
      safeSource(() => fetchBinanceFuturesPrices(binanceSymbols), []),
      safeSource(() => fetchTwsePrices(twSymbols), []),
      safeSource(() => fetchUsStockPrices(usStockSymbols), []),
      safeSource(() => fetchTaifexPrices(collectTaifexTargets()), {}),
      safeSource(() => readManualPrices(), {}),
      safeSource(() => readLatestPrices(), null),
    ]);

  const prices: Record<string, number> = {};
  for (const q of [...binanceQuotes, ...twseQuotes, ...usStockQuotes]) {
    prices[q.symbol] = q.price;
  }
  for (const [symbol, price] of Object.entries(taifexPrices)) {
    prices[symbol] = price;
  }
  // 手動價僅在自動報價失敗時補位
  for (const [symbol, price] of Object.entries(manualPrices)) {
    if (prices[symbol] == null) prices[symbol] = price;
  }
  // 單一來源失敗時沿用上一筆成功價，避免整站 502
  if (previous?.prices) {
    for (const sym of allSymbols) {
      if (prices[sym] == null && previous.prices[sym] != null) {
        prices[sym] = previous.prices[sym];
      }
    }
  }

  const unsupported = allSymbols.filter((s) => prices[s] == null);

  return {
    prices,
    updatedAt: new Date().toISOString(),
    unsupported,
  };
}

function toSnapshot(
  latest: AitgpLatestPrices,
  chartHistory: Awaited<ReturnType<typeof readSnapshots>>,
  settledExits: Record<string, Record<string, string>>,
): AitgpPriceSnapshot {
  return {
    prices: latest.prices,
    updatedAt: latest.updatedAt,
    unsupported: latest.unsupported,
    chartHistory,
    settledExits,
  };
}

/** 向交易所拉最新價、寫入磁碟並追加每小時快照（cron 與 fallback 共用） */
export async function refreshAitgpPrices(): Promise<AitgpPriceSnapshot> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    const latest = await fetchQuotes();
    await writeLatestPrices(latest);
    const [chartHistory, settledExits] = await Promise.all([
      appendHourlySnapshots(latest.prices),
      getSettledExitsByRound(),
    ]);
    return toSnapshot(latest, chartHistory, settledExits);
  })().finally(() => {
    refreshPromise = null;
  });

  return refreshPromise;
}

/** 讀取已持久化的行情；過期時才 fallback 重新抓取 */
export async function getAitgpPrices(): Promise<AitgpPriceSnapshot> {
  const [latest, chartHistory, settledExits] = await Promise.all([
    readLatestPrices(),
    readSnapshots(),
    getSettledExitsByRound(),
  ]);

  if (latest && isWithinTtl(latest.updatedAt)) {
    return toSnapshot(latest, chartHistory, settledExits);
  }

  try {
    return await refreshAitgpPrices();
  } catch (err) {
    // 刷新失敗時仍回傳磁碟快取，避免前端整頁 502 / 圖表空白
    if (latest) return toSnapshot(latest, chartHistory, settledExits);
    throw err;
  }
}
