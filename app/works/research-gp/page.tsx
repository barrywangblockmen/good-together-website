import type { Metadata } from "next";
import { ResearchRaceDashboard } from "@/components/research-gp/research-race-dashboard";
import { createMetadata } from "@/lib/metadata";

const title = "GT投研目標價大賞";
const description =
  "8 位研究員、每人 3 份報告、3 個月與 6 個月雙目標的即時競賽榜。每天依最新實際價格更新誤差與暫定名次。";
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
