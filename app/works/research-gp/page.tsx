import { notFound } from "next/navigation";

// GT 預測市場暫時下架：直連 /works/research-gp 回 404。
// 恢復時改回下方原始實作，並同步打開 /works 入口與 sitemap。
export default function ResearchGrandPrixPage() {
  notFound();
}

/*
import type { Metadata } from "next";
import { ResearchRaceDashboard } from "@/components/research-gp/research-race-dashboard";
import { createMetadata } from "@/lib/metadata";

const title = "GT預測市場";
const description =
  "GT年度市場預測賽，以標準化相對誤差衡量跨資產、跨週期的價格預測表現，並依市場行情即時更新官方排名。";
const baseMetadata = createMetadata({
  title,
  description,
  path: "/works/research-gp",
});

export const metadata: Metadata = {
  ...baseMetadata,
  openGraph: {
    ...baseMetadata.openGraph,
    images: [],
  },
};

export default function ResearchGrandPrixPage() {
  return <ResearchRaceDashboard />;
}
*/
