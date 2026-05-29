#!/usr/bin/env node

import { readFile } from "node:fs/promises";

function usage() {
  console.error(`Usage:
  NEWSLETTER_API_SECRET=xxx node scripts/send-newsletter.mjs \\
    --url https://your-domain.org \\
    --subject "GT 共好電子報 #1" \\
    --html-file ./draft.html \\
    [--dry-run]

Options:
  --url         Site base URL (or set NEWSLETTER_SITE_URL)
  --subject     Email subject line
  --html-file   Path to HTML body file
  --dry-run     Count recipients without sending
`);
  process.exit(1);
}

function parseArgs(argv) {
  const opts = {
    url: process.env.NEWSLETTER_SITE_URL || "",
    subject: "",
    htmlFile: "",
    dryRun: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--url") {
      opts.url = argv[++i] || "";
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

if (!secret || !opts.url || !opts.subject || !opts.htmlFile) {
  usage();
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
