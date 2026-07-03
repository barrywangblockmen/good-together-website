#!/usr/bin/env node

/**
 * 擷取 AITGP 整頁截圖（本機執行；可由 Cursor Automations 每週六 08:00 觸發）。
 * 預設站次邏輯需與 lib/aitgp.ts getDefaultRoundId 一致。
 */

import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

const SEASON_YEAR = 2026;

/** @type {{ id: string; period: string }[]} */
const ROUNDS = [
  { id: "warmup", period: "6/29（一）– 7/3（五）" },
  { id: "r01", period: "7/6（一）– 7/17（五）" },
  { id: "r02", period: "7/27（一）– 8/7（五）" },
  { id: "r03", period: "8/17（一）– 8/28（五）" },
  { id: "r04", period: "9/7（一）– 9/18（五）" },
  { id: "r05", period: "9/28（一）– 10/9（五）" },
  { id: "r06", period: "10/19（一）– 10/30（五）" },
  { id: "r07", period: "11/9（一）– 11/20（五）" },
  { id: "r08", period: "11/30（一）– 12/11（五）" },
];

function parseRoundTradingDates(period, year = SEASON_YEAR) {
  const m = period.match(/(\d{1,2})\/(\d{1,2}).*?[–-]\s*(\d{1,2})\/(\d{1,2})/);
  if (!m) return null;
  const pad = (n) => String(n).padStart(2, "0");
  return {
    start: new Date(`${year}-${pad(Number(m[1]))}-${pad(Number(m[2]))}T00:00:00+08:00`),
    end: new Date(`${year}-${pad(Number(m[3]))}-${pad(Number(m[4]))}T23:59:59.999+08:00`),
  };
}

function taipeiStartOfDay(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Taipei",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const get = (type) => parts.find((p) => p.type === type)?.value ?? "01";
  return new Date(`${get("year")}-${get("month")}-${get("day")}T00:00:00+08:00`);
}

function taipeiDateLabel(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Taipei",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const get = (type) => parts.find((p) => p.type === type)?.value ?? "01";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

function getDefaultRoundId(now = new Date()) {
  const today = taipeiStartOfDay(now);

  for (const round of ROUNDS) {
    const range = parseRoundTradingDates(round.period);
    if (!range) continue;
    if (today >= range.start && today <= range.end) return round.id;
  }

  let next = null;
  for (const round of ROUNDS) {
    const range = parseRoundTradingDates(round.period);
    if (!range || range.start <= today) continue;
    if (!next || range.start < next.start) next = { id: round.id, start: range.start };
  }
  if (next) return next.id;

  for (let i = ROUNDS.length - 1; i >= 0; i--) {
    const range = parseRoundTradingDates(ROUNDS[i].period);
    if (range && today > range.end) return ROUNDS[i].id;
  }

  return ROUNDS[0]?.id ?? "warmup";
}

const url = process.env.AITGP_SCREENSHOT_URL ?? "https://gtclub.tw/works/aitgp";
const outDir =
  process.env.AITGP_SCREENSHOT_DIR ??
  path.join(os.homedir(), "Pictures", "AITGP-Screenshots");

const roundId = getDefaultRoundId();
const outPath = path.join(outDir, `aitgp-${taipeiDateLabel()}.png`);

await mkdir(outDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 2,
});

try {
  console.log(`AITGP screenshot: ${url} (expected round: ${roundId})`);
  await page.goto(url, { waitUntil: "networkidle", timeout: 120_000 });

  await page.waitForFunction(
    (expected) => {
      const teams = document.querySelector('[data-aitgp-section="teams"]');
      const chart = document.querySelector('[data-aitgp-section="chart"]');
      return (
        teams?.getAttribute("data-aitgp-round") === expected &&
        chart?.getAttribute("data-aitgp-round") === expected
      );
    },
    roundId,
    { timeout: 60_000 },
  );

  await page.waitForTimeout(1000);
  await page.screenshot({ path: outPath, fullPage: true });
  console.log(`Screenshot saved: ${outPath}`);
} finally {
  await browser.close();
}
