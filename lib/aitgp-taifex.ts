import { ROUND_ENTRIES } from "@/lib/aitgp";

const SEASON_YEAR = 2026;

export type TaifexTarget =
  | { symbol: "MTX"; contract: string }
  | { symbol: string; contract: string; strike: number; right: "put" | "call" };

/** 例：07w1 44500P → 202607W1 / 44500 put */
export function parseTxoSymbol(symbol: string): Omit<Extract<TaifexTarget, { strike: number }>, "symbol"> | null {
  const m = symbol.match(/^(\d{2})w(\d)\s+(\d+)([PC])$/i);
  if (!m) return null;
  const [, mm, week, strike, pc] = m;
  return {
    contract: `${SEASON_YEAR}${mm}W${week}`,
    strike: Number(strike),
    right: pc.toUpperCase() === "P" ? "put" : "call",
  };
}

/** 從喊單彙整需向 TAIFEX 查價的標的 */
export function collectTaifexTargets(): TaifexTarget[] {
  const map = new Map<string, TaifexTarget>();

  for (const entry of ROUND_ENTRIES) {
    for (const leg of [...entry.main, ...entry.sprint]) {
      if (leg.symbol === "MTX" && leg.taifexContract) {
        map.set(`MTX:${leg.taifexContract}`, { symbol: "MTX", contract: leg.taifexContract });
        continue;
      }
      const txo = parseTxoSymbol(leg.symbol);
      if (txo) {
        map.set(leg.symbol, { symbol: leg.symbol, ...txo });
      }
    }
  }

  return [...map.values()];
}

function taipeiDateParts(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Taipei",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "01";
  return { y: get("year"), m: get("month"), d: get("day") };
}

function taifexQueryDate(date = new Date()) {
  const { y, m, d } = taipeiDateParts(date);
  return `${y}%2F${m}%2F${d}`;
}

async function fetchTaifexCsv(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: { "User-Agent": "good-together-website/aitgp" },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`TAIFEX HTTP ${res.status}`);
  const buf = await res.arrayBuffer();
  return new TextDecoder("big5").decode(buf);
}

function parseCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (const ch of line) {
    if (ch === '"') {
      inQuotes = !inQuotes;
      continue;
    }
    if (ch === "," && !inQuotes) {
      out.push(cur.trim());
      cur = "";
      continue;
    }
    cur += ch;
  }
  out.push(cur.trim());
  return out;
}

type SessionRow = { session: string; price: number };

/** 期貨：同日多時段時優先一般交易，盤後為備援 */
function pickSessionPrice(rows: SessionRow[]): number | undefined {
  const regular = rows.find((r) => r.session === "一般" && r.price > 0);
  const after = rows.find((r) => r.session === "盤後" && r.price > 0);
  return regular?.price ?? after?.price;
}

export async function fetchMtxPrice(contract: string, date = new Date()): Promise<number | undefined> {
  const qd = taifexQueryDate(date);
  const contractKey = contract.trim();
  const url =
    `https://www.taifex.com.tw/cht/3/futDataDown?down_type=1&commodity_id=MTX` +
    `&contract_date=${encodeURIComponent(contractKey)}&queryStartDate=${qd}&queryEndDate=${qd}`;

  const text = await fetchTaifexCsv(url);
  const rows: SessionRow[] = [];

  for (const line of text.split(/\r?\n/).slice(1)) {
    if (!line.trim()) continue;
    const cols = parseCsvLine(line);
    if (cols[1] !== "MTX") continue;
    if (cols[2]?.trim() !== contractKey) continue;
    const price = Number(cols[6]?.replace(/,/g, ""));
    const session = cols[17] ?? "一般";
    if (Number.isFinite(price) && price > 0) rows.push({ session, price });
  }

  return pickSessionPrice(rows);
}

export async function fetchTxoPrice(
  contract: string,
  strike: number,
  right: "put" | "call",
  date = new Date(),
): Promise<number | undefined> {
  const qd = taifexQueryDate(date);
  const rightLabel = right === "put" ? "賣權" : "買權";
  const url =
    `https://www.taifex.com.tw/cht/3/optDataDown?down_type=1&commodity_id=TXO` +
    `&contract_date=${encodeURIComponent(contract)}&queryStartDate=${qd}&queryEndDate=${qd}`;

  const text = await fetchTaifexCsv(url);
  const rows: SessionRow[] = [];

  for (const line of text.split(/\r?\n/).slice(1)) {
    if (!line.trim()) continue;
    const cols = parseCsvLine(line);
    if (cols[1] !== "TXO") continue;
    if (cols[2]?.trim() !== contract) continue;
    if (Number(cols[3]) !== strike) continue;
    if (cols[4] !== rightLabel) continue;
    const price = Number(cols[8]?.replace(/,/g, ""));
    const session = cols[17] ?? cols[16] ?? "一般";
    if (Number.isFinite(price) && price > 0) rows.push({ session, price });
  }

  return pickSessionPrice(rows);
}

export async function fetchTaifexPrices(targets: TaifexTarget[]): Promise<Record<string, number>> {
  const prices: Record<string, number> = {};

  await Promise.all(
    targets.map(async (t) => {
      try {
        if (t.symbol === "MTX") {
          const price = await fetchMtxPrice(t.contract);
          if (price != null) prices.MTX = price;
          return;
        }
        if ("strike" in t) {
          const price = await fetchTxoPrice(t.contract, t.strike, t.right);
          if (price != null) prices[t.symbol] = price;
        }
      } catch {
        // 單一標的失敗不阻斷整批
      }
    }),
  );

  return prices;
}
