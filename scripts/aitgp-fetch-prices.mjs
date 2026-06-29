#!/usr/bin/env node

const url = process.env.AITGP_CRON_URL ?? "http://127.0.0.1:3000/api/aitgp/cron";
const secret = process.env.AITGP_CRON_SECRET;

if (!secret) {
  console.error("AITGP_CRON_SECRET is required");
  process.exit(1);
}

const res = await fetch(url, {
  method: "POST",
  headers: {
    Authorization: `Bearer ${secret}`,
  },
});

const body = await res.json().catch(() => null);

if (!res.ok) {
  console.error(`AITGP price refresh failed (${res.status}):`, body?.error ?? body);
  process.exit(1);
}

console.log("AITGP price refresh ok:", body);
