import { Reveal } from "@/components/motion/reveal";
import { createMetadata } from "@/lib/metadata";

export const metadata = createMetadata({
  title: "主題與課程",
  description:
    "AI、Web3、永續三大主題與會員專屬線上課程規劃，協助你與趨勢接軌、把學習帶回生活。",
  path: "/themes",
});

const pillars = [
  {
    icon: "◎",
    title: "AI 人工智慧",
    body: "探索人工智慧的無限可能，從基礎概念到實際應用，一起掌握未來趨勢。",
    course: "會員課程",
    items: "會員專屬 AI 工作坊、ChatGPT 實務應用、AI 工具整合流程",
  },
  {
    icon: "◫",
    title: "Web3 區塊鏈",
    body: "深入了解去中心化技術，區塊鏈應用場景與 Web3 生態系發展。",
    course: "會員課程",
    items: "區塊鏈基礎、NFT 與數位資產、DeFi 實務應用",
  },
  {
    icon: "◌",
    title: "永續",
    body: "關注環境與社會議題，探討永續經營與企業社會責任的實踐方式。",
    course: "會員課程",
    items: "ESG 指標、小永續行動策略、碳中和趨勢研討",
  },
];

export default function ThemesPage() {
  return (
    <div>
      <section className="mesh-bg border-b border-edge">
        <div className="mx-auto max-w-6xl px-4 py-16 text-center md:px-6 md:py-24">
          <Reveal>
            <p className="text-sm text-muted">Themes & Courses</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-ink md:text-6xl">
              主題與課程
            </h1>
            <p className="mx-auto mt-5 max-w-3xl text-pretty text-lg leading-relaxed text-muted">
              我們聚焦三大替代議題，透過專業課程、工作坊與論壇，幫助會員掌握最新趨勢，提升專業能力。
            </p>
          </Reveal>
        </div>
      </section>

      <section className="border-t border-edge bg-surface">
        <div className="mx-auto max-w-5xl px-4 py-14 md:px-6 md:py-20">
          <div className="space-y-6">
            {pillars.map((p, i) => (
              <Reveal key={p.title} delay={0.06 * i}>
                <article className="rounded-2xl border border-edge bg-surface-elevated/70 px-6 py-6 shadow-sm md:px-8">
                  <div className="flex items-start gap-4">
                    <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-lg font-semibold text-primary">
                      {p.icon}
                    </span>
                    <div className="min-w-0 flex-1">
                      <h2 className="text-3xl font-semibold text-ink">{p.title}</h2>
                      <p className="mt-3 text-base leading-relaxed text-muted">{p.body}</p>
                      <div className="mt-5 rounded-xl border border-edge bg-page/70 px-4 py-3">
                        <p className="text-sm font-semibold text-ink">✦ {p.course}</p>
                        <p className="mt-1 text-sm text-muted">{p.items}</p>
                      </div>
                    </div>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
