#!/usr/bin/env node

import { readFile } from "node:fs/promises";

const VALID_TOPICS = [
  "btc-daily",
  "crypto-weekly",
  "activity-monthly",
  "course-monthly",
  "tw-stock-weekly",
];

function usage() {
  console.error(`Usage:
  NEWSLETTER_API_SECRET=xxx node scripts/send-newsletter.mjs \\
    --url https://your-domain.org \\
    --topic btc-daily \\
    --subject "GT BTC 日報 2026-05-29" \\
    --html-file ./draft.html \\
    [--dry-run]

Topics:
  btc-daily           比特幣行情日報
  crypto-weekly       加密社群週報
  activity-monthly    每月活動精彩回顧
  course-monthly      每月課程回顧
  tw-stock-weekly     台股社群週報

Options:
  --url         Site base URL (or set NEWSLETTER_SITE_URL)
  --topic       Newsletter topic id (required)
  --subject     Email subject line
  --html-file   Path to HTML body file
  --dry-run     Count recipients without sending
`);
  process.exit(1);
}

function parseArgs(argv) {
  const opts = {
    url: process.env.NEWSLETTER_SITE_URL || "",
    topic: "",
    subject: "",
    htmlFile: "",
    dryRun: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--url") {
      opts.url = argv[++i] || "";
    } else if (arg === "--topic") {
      opts.topic = argv[++i] || "";
    } else if (arg === "--subject") {
      opts.subject = argv[++i] || "";
    } else if (arg === "--html-file") {
      opts.htmlFile = argv[++i] || "";
    } else if (arg === "--dry-run") {
      opts.dryRun = true;
    } else if (arg === "--help" || arg === "-h") {
      usage();
    }
  }

  return opts;
}

const opts = parseArgs(process.argv.slice(2));
const secret = process.env.NEWSLETTER_API_SECRET;

if (!secret || !opts.url || !opts.topic || !opts.subject || !opts.htmlFile) {
  usage();
}

if (!VALID_TOPICS.includes(opts.topic)) {
  console.error(`Invalid topic: ${opts.topic}`);
  console.error(`Valid topics: ${VALID_TOPICS.join(", ")}`);
  process.exit(1);
}

const html = await readFile(opts.htmlFile, "utf8");
const endpoint = new URL("/api/newsletter/send", opts.url.replace(/\/$/, ""));

const res = await fetch(endpoint, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${secret}`,
  },
  body: JSON.stringify({
    topic: opts.topic,
    subject: opts.subject,
    html,
    dryRun: opts.dryRun,
  }),
});

const data = await res.json().catch(() => ({}));

if (!res.ok) {
  console.error("Send failed:", res.status, data);
  process.exit(1);
}

console.log(JSON.stringify(data, null, 2));
