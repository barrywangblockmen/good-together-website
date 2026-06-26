import Link from "next/link";
import { Reveal } from "@/components/motion/reveal";
import { createMetadata } from "@/lib/metadata";

export const metadata = createMetadata({
  title: "成果展示",
  description:
    "台灣共好交流協會持續推動各項計畫與活動，包含 AI 賦能企業轉型、Web3 社群共學與永續創新論壇等重點成果。",
  path: "/works",
});

const works = [
  {
    tag: "AI",
    title: "AI 賦能企業轉型計畫",
    description:
      "協助中小企業導入 AI 工具，提升營運效率與決策品質，並整合 AI 會計系統與 AI 會議整合系統，將帳務管理、會議摘要與行動追蹤串成一套可落地的轉型流程。",
  },
  {
    tag: "Web3",
    title: "Web3 社群共學營",
    description:
      "舉辦系列工作坊，帶領會員深入探索區塊鏈技術與應用場景，從基礎概念到實務案例，建立可持續的共學與交流機制。",
  },
  {
    tag: "永續",
    title: "永續創新論壇",
    description:
      "邀請業界專家分享永續發展策略，促進跨領域交流與合作，讓企業與社群在成長的同時，也能實踐長期的社會與環境價值。",
  },
];

export default function WorksPage() {
  return (
    <div>
      <section className="mesh-bg border-b border-edge">
        <div className="mx-auto max-w-6xl px-4 py-16 text-center md:px-6 md:py-24">
          <Reveal>
            <p className="text-sm text-muted">Our Works</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-ink md:text-6xl">
              成果展示
            </h1>
            <p className="mx-auto mt-5 max-w-4xl text-pretty text-lg leading-relaxed text-muted">
              我們持續推動各項計畫與活動，創造會員與社會的共同價值，以下是部分重點成果。
            </p>
          </Reveal>
        </div>
      </section>

      <section className="border-t border-edge bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-14 md:px-6 md:py-20">
          <Reveal>
            <Link
              href="/works/aitgp"
              className="group relative mb-8 block overflow-hidden rounded-2xl border border-rose-500/40 bg-gradient-to-r from-[#1a1014] via-[#241016] to-[#1a0e12] px-6 py-7 shadow-sm transition hover:border-rose-400/70 md:px-8"
            >
              <span
                className="pointer-events-none absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-amber-500/15 to-transparent"
                aria-hidden
              />
              <div className="relative flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="inline-flex rounded-full bg-gradient-to-r from-rose-500 to-amber-500 px-3 py-1 text-xs font-semibold text-white">
                    NEW · 賽事看板
                  </span>
                  <h2 className="mt-3 text-2xl font-semibold text-white md:text-3xl">
                    AITGP 交易大獎賽
                  </h2>
                  <p className="mt-2 max-w-2xl text-sm leading-relaxed text-rose-100/80 md:text-base">
                    AI Trading Grand Prix — 把 F1 的車隊、站次與積分精神帶進交易場。進入戰況看板，查看各車隊每站的標的與盈虧。
                  </p>
                </div>
                <span className="inline-flex items-center gap-2 rounded-full border border-rose-400/50 px-4 py-2 text-sm font-medium text-white transition group-hover:bg-rose-500/20">
                  進入戰況看板
                  <span aria-hidden className="transition group-hover:translate-x-0.5">
                    →
                  </span>
                </span>
              </div>
            </Link>
          </Reveal>
          <div className="space-y-6">
            {works.map((w, i) => (
              <Reveal key={w.title} delay={0.06 * i}>
                <article className="rounded-2xl border border-edge bg-surface-elevated/70 px-6 py-6 shadow-sm md:px-8">
                  <span className="inline-flex rounded-full bg-primary/12 px-3 py-1 text-xs font-semibold text-primary">
                    {w.tag}
                  </span>
                  <h2 className="mt-4 text-4xl font-semibold text-ink md:text-4xl">{w.title}</h2>
                  <p className="mt-3 text-lg leading-relaxed text-muted">{w.description}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
