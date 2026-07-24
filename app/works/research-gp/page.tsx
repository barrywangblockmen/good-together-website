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
