const BOT_UA_RE =
  /(bot|crawler|spider|slurp|bingpreview|facebookexternalhit|headlesschrome|python-requests|curl|wget|httpclient|monitor|uptime|scan|scrapy|go-http-client)/i;

const PRIVATE_IP_RE =
  /^(127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[0-1])\.|::1$|fc00:|fd00:|fe80:)/i;

const geoCache = new Map<string, string>();

export function isLikelyBot(userAgent: string) {
  const ua = userAgent.trim();
  if (!ua) return true;
  return BOT_UA_RE.test(ua);
}

export function getGeoLabel(ip: string) {
  if (!ip || ip === "unknown") return "未知";
  if (PRIVATE_IP_RE.test(ip)) return "內部或私有網路";
  return geoCache.get(ip) || "待查詢";
}

export async function resolveGeoLabel(ip: string): Promise<string> {
  if (!ip || ip === "unknown") return "未知";
  if (PRIVATE_IP_RE.test(ip)) return "內部或私有網路";

  const cached = geoCache.get(ip);
  if (cached) return cached;

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 1200);
    const res = await fetch(`https://ipwho.is/${encodeURIComponent(ip)}`, {
      signal: controller.signal,
      cache: "no-store",
    });
    clearTimeout(timer);
    if (!res.ok) return "未知";

    const data = (await res.json()) as {
      success?: boolean;
      country?: string;
      region?: string;
      city?: string;
    };
    if (!data.success) return "未知";

    const parts = [data.country, data.region, data.city].filter(
      (v): v is string => Boolean(v && v.trim())
    );
    const label = parts.length > 0 ? parts.join(" / ") : "未知";
    geoCache.set(ip, label);
    return label;
  } catch {
    return "未知";
  }
}

