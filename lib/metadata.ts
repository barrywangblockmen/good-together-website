import type { Metadata } from "next";
import { SITE_NAME } from "@/lib/constants";

export function getSiteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "http://localhost:3000";
}

export const defaultOpenGraph = {
  type: "website" as const,
  locale: "zh_TW",
  siteName: SITE_NAME,
  images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: SITE_NAME }],
};

export function createMetadata({
  title,
  description,
  path = "",
}: {
  title: string;
  description: string;
  path?: string;
}): Metadata {
  const base = getSiteUrl();
  const url = `${base}${path}`;
  return {
    title: `${title} | ${SITE_NAME}`,
    description,
    alternates: { canonical: url },
    openGraph: {
      ...defaultOpenGraph,
      title: `${title} | ${SITE_NAME}`,
      description,
      url,
    },
  };
}
