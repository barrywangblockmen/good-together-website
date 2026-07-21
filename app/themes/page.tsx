import Link from "next/link";
import { Reveal } from "@/components/motion/reveal";
import { AiLearningPath } from "@/components/themes/ai-learning-path";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import { createMetadata } from "@/lib/metadata";

export const metadata = createMetadata({
  title: "主題與課程",
  description:
    "AI、Web3、永續三大主題與會員專屬線上課程規劃，協助你與趨勢接軌、把學習帶回生活。",
  path: "/themes",
});

type Pillar = {
  icon: string;
  title: string;
  body: string;
  course: string;
  items: string[];
  showLearningPath?: boolean;
  featured?: {
    title: string;
    description: string;
    caseStudy?: {
      title: string;
      description: string;
    };
  };
};

const pillars: Pillar[] = [
  {
    icon: "◎",
    title: "AI 人工智慧",
    body: "AI 不只是聊天機器人。我們帶你從「會用工具」走到「會做 Skill」——把日常與工作中的重複任務，變成專屬、可重複使用的 AI 能力，讓技術真正為你省時間、加深度。",
    showLearningPath: true,
    course: "會員課程與工作坊",
    items: [
      "AI Skill 實作教學：手把手帶領，把真實需求做成可重用的 Skill",
      "ChatGPT 與 AI 工具整合，串起完整工作流程",
      "生成式 AI 實務應用與 Prompt 設計",
    ],
    featured: {
      title: "AI Skill 實作工作坊",
      description:
        "不用寫程式，也能讓 AI 真正理解你的工作。我們從你的日常場景出發，一步步拆解任務、設計 Skill，讓 AI 成為貼身的研究助手、行政夥伴或決策參考——做完就能帶回崗位直接用。",
      caseStudy: {
        title: "實戰案例：投資研究報告助手",
        description:
          "協助投資專員建立股票研究 Skill：自動整理財報重點、比較同業表現、產出結構化報告草稿。把繁瑣的資料蒐集交給 AI，把時間留給判斷與決策。",
      },
    },
  },
  {
    icon: "◫",
    title: "Web3 區塊鏈",
    body: "深入了解去中心化技術，區塊鏈應用場景與 Web3 生態系發展。",
    course: "會員課程",
    items: ["區塊鏈基礎", "NFT 與數位資產", "DeFi 實務應用"],
  },
  {
    icon: "◌",
    title: "永續",
    body: "關注環境與社會議題，探討永續經營與企業社會責任的實踐方式。",
    course: "會員課程",
    items: ["ESG 指標", "小永續行動策略", "碳中和趨勢研討"],
  },
];

const resources = [
  {
    tag: "每週課程",
    title: "每週一線上 AI 課",
    description:
      "每週一固定開課，帶你認識與上手最新 AI 工具與應用場景。課後安排一到兩週的相關實作，在夥伴陪伴下把新工具真正用進工作與生活——學完就能用，不用自己摸索。",
    href: "/join",
    external: false,
    cta: "加入後即可參與",
    Icon: WeeklyClassIcon,
  },
  {
    tag: "考照資訊",
    title: "iPAS AI 應用規劃師",
    description:
      "經濟部產業人才能力鑑定（iPAS）的 AI 應用規劃師證照，是台灣 AI 人才的重要認證路徑。我們整理官方考試資訊，協助你掌握報名時程、考科架構與準備方向。",
    href: "https://ipd.nat.gov.tw/ipas/certification/AIAP/exam-info",
    external: true,
    cta: "查看官方考試資訊",
    Icon: CertificateIcon,
  },
  {
    tag: "GT 專屬",
    title: "企業實戰演練",
    description:
      "考照只是起點，實戰才是關鍵。加入 GT 俱樂部後，可參與企業實戰演練——在真實工作場景中驗證所學，與夥伴一起把 AI 能力落地到日常與職場。",
    href: "/join",
    external: false,
    cta: "了解如何加入",
    Icon: BriefcaseIcon,
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
              我們聚焦三大前瞻議題，透過專業課程、工作坊與實戰演練，幫助會員掌握最新趨勢，把學習變成可帶走的能力。
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
                      {p.showLearningPath ? <AiLearningPath /> : null}
                      <div className="mt-5 rounded-xl border border-edge bg-page/70 px-4 py-3">
                        <p className="text-sm font-semibold text-ink">✦ {p.course}</p>
                        <ul className="mt-2 space-y-1.5">
                          {p.items.map((item) => (
                            <li key={item} className="text-sm text-muted">
                              · {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                      {p.featured ? (
                        <div className="mt-4 rounded-xl border border-primary/20 bg-primary/5 px-4 py-4">
                          <p className="text-sm font-semibold text-primary">{p.featured.title}</p>
                          <p className="mt-2 text-sm leading-relaxed text-muted">
                            {p.featured.description}
                          </p>
                          {p.featured.caseStudy ? (
                            <div className="mt-3 rounded-lg border border-edge bg-page/80 px-3 py-3">
                              <p className="text-xs font-semibold text-ink">
                                {p.featured.caseStudy.title}
                              </p>
                              <p className="mt-1 text-sm leading-relaxed text-muted">
                                {p.featured.caseStudy.description}
                              </p>
                            </div>
                          ) : null}
                        </div>
                      ) : null}
                    </div>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-edge bg-page">
        <div className="mx-auto max-w-5xl px-4 py-14 md:px-6 md:py-20">
          <Reveal>
            <SectionHeading
              eyebrow="Resources"
              title="資源分享"
              description="從每週線上課、實作演練到考照與企業實戰，我們整理完整學習資源，陪你從 AI 新手一路成長到職場專家。"
            />
          </Reveal>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {resources.map((r, i) => (
              <Reveal key={r.title} delay={0.06 * i}>
                <article className="flex h-full flex-col rounded-2xl border border-edge bg-surface px-6 py-6 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <span className="w-fit rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                      {r.tag}
                    </span>
                    <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <r.Icon />
                    </span>
                  </div>
                  <h3 className="mt-3 text-xl font-semibold text-ink">{r.title}</h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{r.description}</p>
                  <div className="mt-5">
                    {r.external ? (
                      <a
                        href={r.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-primary transition hover:underline"
                      >
                        {r.cta}
                        <ExternalIcon />
                      </a>
                    ) : (
                      <Button href={r.href} variant="outline" className="text-sm">
                        {r.cta}
                      </Button>
                    )}
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
          <Reveal delay={0.12}>
            <p className="mt-10 text-center text-sm leading-relaxed text-muted">
              認同共好與跨域學習？歡迎{" "}
              <Link href="/join" className="font-medium text-primary hover:underline">
                加入 GT 俱樂部
              </Link>
              ，與我們一起把 AI 能力帶回工作與生活。
            </p>
          </Reveal>
        </div>
      </section>
    </div>
  );
}

function ExternalIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}

function WeeklyClassIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <path d="M8 21h8M12 17v4" />
      <path d="m7 8 3 3 7-7" />
    </svg>
  );
}

function CertificateIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
      <path d="m9 15 2 2 4-4" />
    </svg>
  );
}

function BriefcaseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
      <rect x="2" y="8" width="20" height="12" rx="2" />
      <path d="M10 12h4" />
    </svg>
  );
}
