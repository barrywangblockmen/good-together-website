import Link from "next/link";
import { Reveal } from "@/components/motion/reveal";
import { ResearchReportSkill } from "@/components/works/research-report-skill";
import { getSession, isMember } from "@/lib/auth-session";
import { createMetadata } from "@/lib/metadata";

export const metadata = createMetadata({
  title: "成果展示",
  description:
    "台灣共好交流協會持續推動各項計畫與活動，包含 AI 賦能企業轉型、Web3 社群共學、星隕原野多人網頁遊戲與永續創新論壇等重點成果。",
  path: "/works",
});

const works = [
  {
    tag: "AI",
    title: "AI 賦能企業轉型計畫",
    description:
      "協助中小企業導入 AI 工具，提升營運效率與決策品質，並整合 AI 會計系統與 AI 會議整合系統，將帳務管理、會議摘要與行動追蹤串成一套可落地的轉型流程。",
    showResearchSkill: true,
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
] as const;

export default async function WorksPage() {
  const session = await getSession();
  const member = isMember(session);

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
            <article className="relative mb-8 overflow-hidden rounded-2xl border border-emerald-400/30 bg-gradient-to-br from-[#102c2b] via-[#102426] to-[#171c30] px-6 py-7 shadow-sm md:px-8 md:py-9">
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex rounded-full bg-emerald-300/15 px-3 py-1 text-sm font-medium text-emerald-200">
                  AI 協作開發 · 互動作品
                </span>
                <span className="text-sm text-slate-300">遊戲測試版</span>
              </div>
              <div className="mt-5 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div className="max-w-3xl">
                  <p className="text-sm tracking-widest text-emerald-200/80">STARFALL WILDS</p>
                  <h2 className="mt-2 text-3xl font-semibold text-white md:text-4xl">星隕原野</h2>
                  <p className="mt-4 text-base leading-relaxed text-slate-200">
                    打開瀏覽器，踏入像素風格的多人冒險世界。從六種職業中選擇自己的戰鬥方式，穿越森林、發現地標、深入危險區域；沒有任務清單，靠探索、打怪與收集裝備累積成長。
                  </p>
                  <p className="mt-3 text-base leading-relaxed text-slate-300">
                    以 AI 協作將遊戲構想實作成可遊玩的網頁原型，整合即時多人同步、點擊自動尋路、技能學習與升級，以及自動拾取、換裝與售出系統，讓玩家專注於探索與戰鬥。
                  </p>
                  <ul className="mt-5 flex flex-wrap gap-2 text-sm text-emerald-100" aria-label="遊戲特色">
                    {["六種職業", "即時多人", "自由探索", "技能與裝備成長"].map((feature) => (
                      <li key={feature} className="rounded-full border border-emerald-200/20 px-3 py-1.5">{feature}</li>
                    ))}
                  </ul>
                </div>
                <a
                  href="/starfall-wilds/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex shrink-0 self-start items-center justify-center gap-2 rounded-full bg-emerald-200 px-6 py-3 text-base font-semibold text-slate-950 transition hover:bg-emerald-100 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-200 md:self-center"
                >
                  開始探索<span aria-hidden>↗</span><span className="sr-only">星隕原野（另開分頁）</span>
                </a>
              </div>
            </article>
          </Reveal>
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
          {/* GT 預測市場暫時下架
          <Reveal>
            <Link
              href="/works/research-gp"
              className="group relative mb-8 block overflow-hidden rounded-2xl border border-cyan-500/30 bg-gradient-to-r from-[#081a21] via-[#0d2329] to-[#151d20] px-6 py-7 shadow-sm transition hover:border-cyan-300/60 md:px-8"
            >
              <span
                className="pointer-events-none absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-amber-400/15 to-transparent"
                aria-hidden
              />
              <div className="relative flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="inline-flex rounded-full bg-cyan-300 px-3 py-1 text-xs font-semibold text-slate-950">
                    OFFICIAL · 年度市場預測賽
                  </span>
                  <h2 className="mt-3 text-2xl font-semibold text-white md:text-3xl">
                    GT預測市場
                  </h2>
                  <p className="mt-2 max-w-2xl text-sm leading-relaxed text-cyan-50/75 md:text-base">
                    以標準化相對誤差衡量跨資產、跨週期的市場預測表現，並依市場行情即時更新官方排名。
                  </p>
                </div>
                <span className="inline-flex items-center gap-2 rounded-full border border-cyan-300/40 px-4 py-2 text-sm font-medium text-white transition group-hover:bg-cyan-300/10">
                  進入預測市場
                  <span aria-hidden className="transition group-hover:translate-x-0.5">
                    →
                  </span>
                </span>
              </div>
            </Link>
          </Reveal>
          */}
          <div className="space-y-6">
            {works.map((w, i) => (
              <Reveal key={w.title} delay={0.06 * i}>
                <article className="rounded-2xl border border-edge bg-surface-elevated/70 px-6 py-6 shadow-sm md:px-8">
                  <span className="inline-flex rounded-full bg-primary/12 px-3 py-1 text-xs font-semibold text-primary">
                    {w.tag}
                  </span>
                  <h2 className="mt-4 text-4xl font-semibold text-ink md:text-4xl">{w.title}</h2>
                  <p className="mt-3 text-lg leading-relaxed text-muted">{w.description}</p>
                  {"showResearchSkill" in w && w.showResearchSkill ? (
                    <ResearchReportSkill isMember={member} />
                  ) : null}
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
