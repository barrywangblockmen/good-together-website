/**
 * Resolve public site URL for server-side links (e.g. newsletter unsubscribe).
 * Prefer SITE_URL (runtime) over NEXT_PUBLIC_SITE_URL (may be inlined at build).
 * When handling HTTP requests, derive from forwarded headers as fallback.
 */
export function getPublicSiteUrl(request?: Request): string {
  const fromEnv =
    process.env.SITE_URL?.replace(/\/$/, "") ||
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");

  if (fromEnv && !isBadHost(fromEnv)) {
    return fromEnv;
  }

  if (request) {
    const derived = deriveFromRequest(request);
    if (derived) return derived;
  }

  return "http://localhost:3000";
}

function isBadHost(url: string) {
  return /0\.0\.0\.0|127\.0\.0\.1|localhost/i.test(url);
}

function deriveFromRequest(request: Request): string | null {
  const forwardedHost = request.headers.get("x-forwarded-host");
  const hostHeader = request.headers.get("host");
  const host = (forwardedHost || hostHeader || "").split(",")[0]?.trim();
  if (!host || isBadHost(host)) return null;

  const proto =
    request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim() || "https";
  return `${proto}://${host}`;
}
