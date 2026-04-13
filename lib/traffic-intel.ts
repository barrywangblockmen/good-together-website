const BOT_UA_RE =
  /(bot|crawler|spider|slurp|bingpreview|facebookexternalhit|headlesschrome|python-requests|curl|wget|httpclient|monitor|uptime|scan|scrapy|go-http-client)/i;

const PRIVATE_IP_RE =
  /^(127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[0-1])\.|::1$|fc00:|fd00:|fe80:)/i;

const geoCache = new Map<string, string>();
const GEO_UNKNOWN = "未知";

type GeoProviderResult = {
  country?: string;
  region?: string;
  city?: string;
};

export function isLikelyBot(userAgent: string) {
  const ua = userAgent.trim();
  if (!ua) return true;
  return BOT_UA_RE.test(ua);
}

export function getGeoLabel(ip: string) {
  if (!ip || ip === "unknown") return GEO_UNKNOWN;
  if (PRIVATE_IP_RE.test(ip)) return "內部或私有網路";
  return geoCache.get(ip) || "待查詢";
}

export async function resolveGeoLabel(ip: string): Promise<string> {
  if (!ip || ip === "unknown") return GEO_UNKNOWN;
  if (PRIVATE_IP_RE.test(ip)) return "內部或私有網路";

  const cached = geoCache.get(ip);
  if (cached) return cached;

  const providers = [resolveFromIpwho, resolveFromIpapi];
  for (const provider of providers) {
    try {
      const maybe = await provider(ip);
      if (!maybe) continue;
      const label = buildGeoLabel(maybe);
      if (label !== GEO_UNKNOWN) {
        geoCache.set(ip, label);
        return label;
      }
    } catch {
      // Ignore single provider failure and continue fallback chain.
    }
  }

  return GEO_UNKNOWN;
}

async function resolveFromIpwho(ip: string): Promise<GeoProviderResult | null> {
  const res = await fetchWithTimeout(`https://ipwho.is/${encodeURIComponent(ip)}`, 2200);
  if (!res.ok) return null;
  const data = (await res.json()) as {
    success?: boolean;
    country?: string;
    region?: string;
    city?: string;
  };
  if (!data.success) return null;
  return { country: data.country, region: data.region, city: data.city };
}

async function resolveFromIpapi(ip: string): Promise<GeoProviderResult | null> {
  const res = await fetchWithTimeout(
    `https://ipapi.co/${encodeURIComponent(ip)}/json/`,
    2200
  );
  if (!res.ok) return null;
  const data = (await res.json()) as {
    error?: boolean;
    country_name?: string;
    region?: string;
    city?: string;
  };
  if (data.error) return null;
  return { country: data.country_name, region: data.region, city: data.city };
}

function buildGeoLabel(data: GeoProviderResult) {
  const parts = [data.country, data.region, data.city].filter(
    (v): v is string => Boolean(v && v.trim())
  );
  return parts.length > 0 ? parts.join(" / ") : GEO_UNKNOWN;
}

async function fetchWithTimeout(url: string, timeoutMs: number) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, {
      signal: controller.signal,
      cache: "no-store",
    });
  } finally {
    clearTimeout(timer);
  }
}

