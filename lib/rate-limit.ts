type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

function prune(key: string, now: number) {
  const b = buckets.get(key);
  if (b && now > b.resetAt) {
    buckets.delete(key);
  }
}

export function checkRateLimit(
  key: string,
  max: number,
  windowMs: number
): { ok: true } | { ok: false; retryAfterMs: number } {
  const now = Date.now();
  prune(key, now);
  let b = buckets.get(key);
  if (!b || now > b.resetAt) {
    b = { count: 0, resetAt: now + windowMs };
    buckets.set(key, b);
  }
  if (b.count >= max) {
    return { ok: false, retryAfterMs: Math.max(0, b.resetAt - now) };
  }
  b.count += 1;
  return { ok: true };
}

export function getClientIp(headers: Headers): string {
  const candidates: Array<string | null> = [
    headers.get("cf-connecting-ip"),
    headers.get("x-vercel-forwarded-for"),
    headers.get("x-forwarded-for"),
    headers.get("x-real-ip"),
    headers.get("true-client-ip"),
    headers.get("x-client-ip"),
  ];

  for (const raw of candidates) {
    if (!raw) continue;
    const first = raw.split(",")[0]?.trim();
    const normalized = normalizeIp(first);
    if (normalized) return normalized;
  }

  return "unknown";
}

function normalizeIp(value?: string) {
  if (!value) return "";
  const v = value.trim();
  if (!v || v.toLowerCase() === "unknown") return "";

  // Common proxy style: "::ffff:1.2.3.4"
  if (v.startsWith("::ffff:")) {
    return v.slice(7);
  }

  // Bracketed IPv6 + optional port: "[2001:db8::1]:443"
  const bracket = v.match(/^\[([^[\]]+)\](?::\d+)?$/);
  if (bracket?.[1]) {
    return bracket[1];
  }

  // IPv4 + optional port: "1.2.3.4:12345"
  const ipv4WithPort = v.match(/^(\d{1,3}(?:\.\d{1,3}){3})(?::\d+)?$/);
  if (ipv4WithPort?.[1]) {
    return ipv4WithPort[1];
  }

  return v;
}
