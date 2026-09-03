import type { MetadataRoute } from "next";

const base = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "http://localhost:3000";

const paths = [
  "",
  "/about",
  "/themes",
  "/works",
  "/works/aitgp",
  // "/works/research-gp", // GT 預測市場暫時下架
  "/activities",
  "/join",
  "/privacy",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return paths.map((path) => ({
    url: `${base}${path || "/"}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: path === "" ? 1 : 0.7,
  }));
}
