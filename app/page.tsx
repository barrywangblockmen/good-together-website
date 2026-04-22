import { Hero } from "@/components/home/hero";
import { ActivityMarquee } from "@/components/home/activity-marquee";
import { Reveal } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SectionHeading } from "@/components/ui/section-heading";

export default function HomePage() {
  return (
    <div>
      <Hero />
      <section className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-24">
        <Reveal>
          <SectionHeading
            eyebrow="Why us"
            title="在共好的底色上，與科技、永續一起前進"
            description="台灣共好交流協會（GT 俱樂部）連結想成長的個人與願意行動的夥伴，用輕鬆但認真的方式，讓彼此與環境更好。"
          />
        </Reveal>
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          <Reveal delay={0.05}>
            <Card>
              <p className="text-sm font-semibold text-primary">G · Good + Growth</p>
              <h3 className="mt-2 text-xl font-semibold text-ink">善意共好與個人成長</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                以善意共好的價值為起點，透過主題交流與會員課程，協助你與 AI、Web3、永續趨勢接軌，把學習變成可帶走的能力。
              </p>
            </Card>
          </Reveal>
          <Reveal delay={0.1}>
            <Card>
              <p className="text-sm font-semibold text-primary">T · Together</p>
              <h3 className="mt-2 text-xl font-semibold text-ink">團隊行動與環境共好</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                我們相信一群人走得更遠。以行動與分享串起社群，讓科技與永續真正落地在生活裡。
              </p>
            </Card>
          </Reveal>
        </div>
      </section>

      <section className="border-y border-edge bg-surface py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <Reveal>
            <SectionHeading
              eyebrow="Focus"
              title="三大主題，與未來對話"
              description="從工具到觀念，從應用到責任，我們用多元視角陪伴會員走在趨勢之上。"
            />
          </Reveal>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              {
                t: "AI",
                d: "生成式 AI、工作流程自動化、資料治理與實務案例，讓技術成為你的助力。",
              },
              {
                t: "Web3",
                d: "鏈上協作、數位資產與信任機制，理解下一世代網路與社群經濟的可能。",
              },
              {
                t: "永續",
                d: "減碳、循環與生活實踐，把永續從口號變成每天可做的一小步。",
              },
            ].map((item, i) => (
              <Reveal key={item.t} delay={0.06 * i}>
                <Card>
                  <p className="text-2xl font-semibold text-primary">{item.t}</p>
                  <p className="mt-3 text-sm leading-relaxed text-muted">{item.d}</p>
                </Card>
              </Reveal>
            ))}
          </div>
          <div className="mt-10 flex justify-center">
            <Button href="/themes" variant="outline">
              查看主題與課程
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-24">
        <Reveal>
          <SectionHeading
            eyebrow="Works"
            title="成果與示範"
            description="協會與夥伴正在建構的實際應用，作為交流與學習的起點。"
          />
        </Reveal>
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          <Reveal>
            <Card>
              <span className="rounded-full bg-page px-3 py-1 text-xs font-medium text-primary">
                AI
              </span>
              <h3 className="mt-3 text-xl font-semibold text-ink">AI 會計系統</h3>
              <p className="mt-2 text-sm text-muted">
                協助小型組織與店家快速整理收支、產出報表，把繁瑣帳務交給可信的工具。
              </p>
            </Card>
          </Reveal>
          <Reveal delay={0.08}>
            <Card>
              <span className="rounded-full bg-page px-3 py-1 text-xs font-medium text-primary">
                AI
              </span>
              <h3 className="mt-3 text-xl font-semibold text-ink">AI 會議整合系統</h3>
              <p className="mt-2 text-sm text-muted">
                摘要、待辦與知識沉澱一站完成，讓會議不再是資訊黑洞，而是行動的起點。
              </p>
            </Card>
          </Reveal>
        </div>
        <div className="mt-10 flex justify-center">
          <Button href="/works" variant="ghost">
            前往成果展示
          </Button>
        </div>
      </section>

      <section className="border-y border-edge bg-surface py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <Reveal>
            <SectionHeading
              eyebrow="Activities"
              title="活動照片精選"
              description="透過活動影像，看見我們在每次相聚中累積的連結與溫度。"
            />
          </Reveal>
          <Reveal delay={0.06}>
            <ActivityMarquee />
          </Reveal>
          <div className="mt-10 flex justify-center">
            <Button href="/activities" variant="outline">
              前往活動照片牆
            </Button>
          </div>
        </div>
      </section>

      <section className="border-y border-edge bg-surface-elevated/70">
        <div className="mx-auto max-w-6xl px-4 py-5 md:px-6 md:py-6">
          <Reveal>
            <div className="rounded-xl border border-edge bg-surface px-4 py-3 text-center md:px-6 md:py-4">
              <p className="text-xs font-semibold tracking-[0.18em] text-primary">今日寄語</p>
              <p className="mt-1 text-sm font-medium text-ink md:text-base">
                「一個人走得快，一群人走得遠，我們一起共好。」
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="mesh-bg border-t border-edge">
        <div className="mx-auto max-w-6xl px-4 py-16 text-center md:px-6 md:py-24">
          <Reveal>
            <h2 className="text-balance text-3xl font-semibold tracking-tight text-ink md:text-4xl">
              想一起共好？從這裡開始
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-pretty text-muted md:text-lg">
              我們以線上表單作為對外聯繫管道，收到後將由協會窗口以 Email 回覆，與你聊聊下一步。
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button href="/join" variant="primary">
                加入連署
              </Button>
              <Button href="/about" variant="outline">
                認識協會
              </Button>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
