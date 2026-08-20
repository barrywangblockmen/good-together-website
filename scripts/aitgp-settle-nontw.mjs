#!/usr/bin/env node

/**
 * 鎖定目前 racing 站次中尚未平倉的非台股標的（加密／美股代幣等）。
 * Usage: node scripts/aitgp-settle-nontw.mjs [roundId]
 */

const base = process.env.AITGP_CRON_URL ?? "http://127.0.0.1:3000";
const secret = process.env.AITGP_CRON_SECRET;
const roundId = process.argv[2];

if (!secret) {
  console.error("AITGP_CRON_SECRET is required");
  process.exit(1);
}

const url = new URL("/api/aitgp/settle", base.replace(/\/$/, ""));
if (roundId) url.searchParams.set("roundId", roundId);

const res = await fetch(url, {
  method: "POST",
  headers: {
    Authorization: `Bearer ${secret}`,
  },
});

const body = await res.json().catch(() => null);

if (!res.ok) {
  console.error(`AITGP non-TW settle failed (${res.status}):`, body?.error ?? body);
  process.exit(1);
}

console.log("AITGP non-TW settle ok:", body);
