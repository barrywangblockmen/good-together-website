import { Reveal } from "@/components/motion/reveal";
import { Card } from "@/components/ui/card";
import { createMetadata } from "@/lib/metadata";

export const metadata = createMetadata({
  title: "關於協會",
  description:
    "認識台灣共好交流協會（GT 俱樂部）的宗旨、願景與章程摘要，與我們一起走向共好的未來。",
  path: "/about",
});

export default function AboutPage() {
  const charterHighlights = [
    "促進會員間的專業交流與合作",
    "推動 AI、Web3、永續發展等領域的知識分享",
    "建立互助共好的社群網絡",
    "舉辦主題工作坊、論壇與研討會",
    "連結產官學資源，創造跨界合作機會",
  ];

  const timeline = [
    { quarter: "2026 Q1", title: "協會籌備啟動" },
    { quarter: "2026 Q2", title: "核心團隊組建" },
    { quarter: "2026 Q3", title: "協會正式成立" },
    { quarter: "2026 Q4", title: "首次會員活動" },
  ];

  return (
    <div>
      <section className="mesh-bg border-b border-edge">
        <div className="mx-auto max-w-6xl px-4 py-16 text-center md:px-6 md:py-24">
          <Reveal>
            <p className="text-sm text-muted">About Us</p>
            <h1 className="mt-3 text-balance text-4xl font-semibold tracking-tight text-ink md:text-6xl">
              關於台灣共好交流協會
            </h1>
            <p className="mx-auto mt-5 max-w-3xl text-pretty text-lg leading-relaxed text-muted">
              我們是一群相信「共好」價值的專業人士，致力於在 AI、Web3 與永續發展領域，
              建立一個開放、互助、共同成長的社群。
            </p>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-24">
        <Reveal>
          <div className="text-center">
            <h2 className="text-3xl font-semibold tracking-tight text-ink md:text-4xl">願景與使命</h2>
            <div className="mx-auto mt-4 h-1 w-20 rounded-full bg-primary/70" />
          </div>
        </Reveal>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <Reveal delay={0.05}>
            <Card className="h-full">
              <h3 className="text-2xl font-semibold text-ink">我們的願景</h3>
              <p className="mt-4 leading-relaxed text-muted">
                成為台灣具影響力的跨領域專業社群，連結產官學各界資源，推動 AI、Web3 與永續發展的知識普及與實踐應用，
                讓每位成員都能在這個平台上找到成長的力量與合作的機會。
              </p>
            </Card>
          </Reveal>
          <Reveal delay={0.1}>
            <Card className="h-full">
              <h3 className="text-2xl font-semibold text-ink">我們的使命</h3>
              <p className="mt-4 leading-relaxed text-muted">
                透過主題工作坊、論壇研討、專案合作等多元形式，促進會員間的專業交流與資源共享，協助個人與組織在快速變遷的時代中保持競爭力，
                共創更美好的未來。
              </p>
            </Card>
          </Reveal>
        </div>
      </section>

      <section className="border-y border-edge bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-24">
          <Reveal>
            <div className="text-center">
              <h2 className="text-3xl font-semibold tracking-tight text-ink md:text-4xl">協會章程重點</h2>
              <p className="mx-auto mt-4 max-w-3xl text-pretty text-muted">
                我們依循以下核心宗旨運作，確保每位會員都能獲得最大的價值。
              </p>
              <div className="mx-auto mt-4 h-1 w-20 rounded-full bg-primary/70" />
            </div>
          </Reveal>
          <div className="mx-auto mt-10 max-w-4xl space-y-4">
            {charterHighlights.map((item, index) => (
              <Reveal key={item} delay={0.04 * index}>
                <div className="flex items-center gap-4 rounded-2xl border border-edge bg-surface-elevated px-5 py-4">
                  <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    ✓
                  </span>
                  <p className="text-base text-ink">{item}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-24">
        <Reveal>
          <div className="text-center">
            <h2 className="text-3xl font-semibold tracking-tight text-ink md:text-4xl">發展歷程</h2>
            <p className="mt-4 text-muted">從籌備到成立，我們一步步實現共好的願景</p>
            <div className="mx-auto mt-4 h-1 w-20 rounded-full bg-primary/70" />
          </div>
        </Reveal>
        <div className="mx-auto mt-12 max-w-2xl">
          <div className="relative ml-4 border-l border-edge pl-8">
            {timeline.map((item, index) => (
              <Reveal key={item.quarter} delay={0.06 * index}>
                <div className="relative mb-8 last:mb-0">
                  <span className="absolute -left-[41px] top-2 size-3 rounded-full bg-primary" />
                  <p className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                    {item.quarter}
                  </p>
                  <p className="mt-3 text-2xl font-semibold text-ink">{item.title}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
