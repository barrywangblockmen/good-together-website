#!/usr/bin/env node
/**
 * 逐一查證 AITGP 各標的參考價 vs 系統自動抓價
 * Usage: node scripts/verify-aitgp-prices.mjs [--trigger URL]
 */

import { readFile } from "node:fs/promises";
import { TextDecoder } from "node:util";

const TWSE_OTC = new Set(["8255", "5536"]);
const BINANCE = new Set(["AAVE", "PUMP", "HYPE", "XAUT", "MUUSDT", "SPCX"]);
const TAIFEX_MTX = { symbol: "MTX", contract: "202607" };
const TAIFEX_TXO = { symbol: "07w1 44500P", contract: "202607W1", strike: 44500 };

const ENTRIES = [
  { team: "Project D", legs: ["AAVE", "2409"] },
  { team: "賺錢要排隊", legs: ["2603", "2356"] },
  { team: "草莓貝瑞", legs: ["PUMP", "HYPE", "XAUT", "MUUSDT"] },
  { team: "員瑛公主", legs: ["2337", "3189"] },
  { team: "紅石", legs: ["8255", "SPCX", "2059", "5536"] },
  { team: "再凹單就會", legs: ["MTX", "07w1 44500P", "2408"] },
  { team: "你說的都隊", legs: ["2330", "2308"] },
  { team: "天竺鼠", legs: ["3481", "6669"] },
];

const ALL_SYMBOLS = [...new Set(ENTRIES.flatMap((e) => e.legs))];

function taipeiDate() {
  const p = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Taipei",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const g = (t) => p.find((x) => x.type === t)?.value ?? "01";
  return `${g("year")}/${g("month")}/${g("day")}`;
}

function parseLadderTop(ladder) {
  if (!ladder) return undefined;
  const top = ladder.split("_")[0]?.replace(/,/g, "");
  if (!top || top === "-") return undefined;
  const n = Number(top);
  return Number.isFinite(n) && n > 0 ? n : undefined;
}

function parseTwseRow(row) {
  const z = row.z?.replace(/,/g, "");
  if (z && z !== "-" && z !== "0.0000") {
    const n = Number(z);
    if (Number.isFinite(n) && n > 0) return n;
  }
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

async function fetchTwse(symbols) {
  const exCh = symbols
    .map((s) => `${TWSE_OTC.has(s) ? "otc" : "tse"}_${s}.tw`)
    .join("|");
  const res = await fetch(
    `https://mis.twse.com.tw/stock/api/getStockInfo.jsp?ex_ch=${encodeURIComponent(exCh)}`,
    {
      headers: {
        Accept: "application/json",
        Referer: "https://mis.twse.com.tw/stock/index.jsp",
      },
    },
  );
  const data = await res.json();
  const out = {};
  for (const row of data.msgArray ?? []) {
    const code = row.c;
    if (!code || !symbols.includes(code)) continue;
    const price = parseTwseRow(row);
    if (price != null) out[code] = price;
  }
  return out;
}

async function fetchBinance(symbols) {
  const res = await fetch("https://fapi.binance.com/fapi/v1/ticker/price");
  const rows = await res.json();
  const need = new Map(symbols.map((s) => [`${s}USDT`, s]));
  const out = {};
  for (const row of rows) {
    const sym = need.get(row.symbol);
    if (!sym) continue;
    out[sym] = Number(row.price);
  }
  return out;
}

function parseCsvLine(line) {
  const out = [];
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

function pickSessionPrice(rows) {
  const regular = rows.find((r) => r.session === "一般" && r.price > 0);
  const after = rows.find((r) => r.session === "盤後" && r.price > 0);
  return regular?.price ?? after?.price;
}

async function fetchTaifexCsv(url) {
  const res = await fetch(url, { headers: { "User-Agent": "good-together-verify/1" } });
  const buf = await res.arrayBuffer();
  return new TextDecoder("big5").decode(buf);
}

async function fetchMtx(contract) {
  const qd = encodeURIComponent(taipeiDate());
  const url =
    `https://www.taifex.com.tw/cht/3/futDataDown?down_type=1&commodity_id=MTX` +
    `&contract_date=${encodeURIComponent(contract)}&queryStartDate=${qd}&queryEndDate=${qd}`;
  const text = await fetchTaifexCsv(url);
  const rows = [];
  for (const line of text.split(/\r?\n/).slice(1)) {
    if (!line.trim()) continue;
    const cols = parseCsvLine(line);
    if (cols[1] !== "MTX" || cols[2]?.trim() !== contract) continue;
    const price = Number(cols[6]?.replace(/,/g, ""));
    const session = cols[17] ?? "一般";
    if (Number.isFinite(price) && price > 0) rows.push({ session, price });
  }
  return pickSessionPrice(rows);
}

async function fetchTxoPut(contract, strike) {
  const qd = encodeURIComponent(taipeiDate());
  const url =
    `https://www.taifex.com.tw/cht/3/optDataDown?down_type=1&commodity_id=TXO` +
    `&contract_date=${encodeURIComponent(contract)}&queryStartDate=${qd}&queryEndDate=${qd}`;
  const text = await fetchTaifexCsv(url);
  const rows = [];
  for (const line of text.split(/\r?\n/).slice(1)) {
    if (!line.trim()) continue;
    const cols = parseCsvLine(line);
    if (cols[1] !== "TXO") continue;
    if (cols[2]?.trim() !== contract) continue;
    if (Number(cols[3]) !== strike) continue;
    if (cols[4] !== "賣權") continue;
    const price = Number(cols[8]?.replace(/,/g, ""));
    const session = cols[17] ?? cols[16] ?? "一般";
    if (Number.isFinite(price) && price > 0) rows.push({ session, price });
  }
  return pickSessionPrice(rows);
}

async function fetchReferencePrices() {
  const tw = ALL_SYMBOLS.filter((s) => /^\d{4}$/.test(s));
  const bin = ALL_SYMBOLS.filter((s) => BINANCE.has(s));

  const [twse, binance, mtx, txo] = await Promise.all([
    fetchTwse(tw),
    fetchBinance(bin),
    fetchMtx(TAIFEX_MTX.contract),
    fetchTxoPut(TAIFEX_TXO.contract, TAIFEX_TXO.strike),
  ]);

  return {
    ...twse,
    ...binance,
    MTX: mtx,
    [TAIFEX_TXO.symbol]: txo,
  };
}

function pctDiff(a, b) {
  if (a == null || b == null) return null;
  if (a === 0) return b === 0 ? 0 : Infinity;
  return (Math.abs(a - b) / Math.abs(a)) * 100;
}

function ok(a, b, tolPct = 0.05) {
  if (a == null || b == null) return false;
  const d = pctDiff(a, b);
  return d <= tolPct;
}

async function readManualFile() {
  try {
    const raw = await readFile("data/aitgp-manual.json", "utf8");
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

const triggerUrl = process.argv.includes("--trigger")
  ? process.argv[process.argv.indexOf("--trigger") + 1]
  : process.env.AITGP_VERIFY_URL;

console.log("=== AITGP 標的價格查證 ===");
console.log(`台北日期: ${taipeiDate()}\n`);

const manual = await readManualFile();
if (manual) {
  console.log("⚠️  本機 data/aitgp-manual.json:", JSON.stringify(manual.prices, null, 2));
} else {
  console.log("✓ 本機無 aitgp-manual.json\n");
}

console.log("查詢各交易所參考價…");
const reference = await fetchReferencePrices();

let system = null;
if (triggerUrl) {
  const secret = process.env.AITGP_CRON_SECRET;
  const headers = secret ? { Authorization: `Bearer ${secret}` } : {};
  const refreshRes = await fetch(`${triggerUrl.replace(/\/$/, "")}/api/aitgp/cron`, {
    method: "POST",
    headers,
  });
  const refreshBody = await refreshRes.json().catch(() => ({}));
  console.log(`觸發更新 ${triggerUrl}:`, refreshRes.status, refreshBody);

  const pricesRes = await fetch(`${triggerUrl.replace(/\/$/, "")}/api/aitgp/prices`);
  system = await pricesRes.json();
} else {
  try {
    const raw = await readFile("data/aitgp-latest.json", "utf8");
    system = JSON.parse(raw);
  } catch {
    console.log("(未指定 --trigger URL，且無本機 data/aitgp-latest.json)");
  }
}

const systemPrices = system?.prices ?? {};
const updatedAt = system?.updatedAt ?? "—";
const unsupported = system?.unsupported ?? [];

console.log(`\n系統 updatedAt: ${updatedAt}`);
console.log(`系統 unsupported: ${unsupported.length ? unsupported.join(", ") : "無"}\n`);

console.log("| 標的 | 參考價 | 系統價 | 差異% | 狀態 |");
console.log("|------|--------|--------|-------|------|");

let pass = 0;
let fail = 0;
let missing = 0;

for (const sym of ALL_SYMBOLS.sort()) {
  const ref = reference[sym];
  const sys = systemPrices[sym];
  let source = "TWSE";
  if (BINANCE.has(sym)) source = "Binance";
  if (sym === "MTX" || sym === "07w1 44500P") source = "TAIFEX";

  let status;
  if (ref == null) {
    status = "參考價取不到";
    missing++;
  } else if (sys == null) {
    status = "系統無資料";
    fail++;
  } else if (ok(ref, sys)) {
    status = "✓ OK";
    pass++;
  } else {
    const d = pctDiff(ref, sys)?.toFixed(2);
    status = `✗ 偏差 ${d}%`;
    fail++;
  }

  const refS = ref == null ? "—" : ref;
  const sysS = sys == null ? "—" : sys;
  const diffS =
    ref != null && sys != null ? (pctDiff(ref, sys)?.toFixed(3) ?? "—") : "—";
  console.log(`| ${sym} (${source}) | ${refS} | ${sysS} | ${diffS} | ${status} |`);
}

console.log("\n=== 各車隊標的一覽 ===");
for (const { team, legs } of ENTRIES) {
  console.log(`\n${team}:`);
  for (const sym of legs) {
    const ref = reference[sym];
    const sys = systemPrices[sym];
    const mark = ref != null && sys != null && ok(ref, sys) ? "✓" : "✗";
    console.log(`  ${mark} ${sym}: 參考=${ref ?? "—"} 系統=${sys ?? "—"}`);
  }
}

console.log(`\n摘要: ${pass} 通過, ${fail} 失敗, ${missing} 參考價缺失`);
process.exit(fail > 0 || missing > 0 ? 1 : 0);
