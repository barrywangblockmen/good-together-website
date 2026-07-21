const steps = [
  {
    title: "入門探索",
    subtitle: "AI 新手",
    description: "從零認識生成式 AI，搞懂基本概念與常用工具",
    Icon: SeedlingIcon,
  },
  {
    title: "每週精進",
    subtitle: "跟上趨勢",
    description: "每週一線上課程，掌握最新 AI 工具與應用場景",
    Icon: CalendarIcon,
  },
  {
    title: "實作演練",
    subtitle: "動手做",
    description: "課後一到兩週實作，把所學變成肌肉記憶",
    Icon: WrenchIcon,
  },
  {
    title: "Skill 建構",
    subtitle: "專屬能力",
    description: "把真實工作流程做成可重複使用的 AI Skill",
    Icon: LayersIcon,
  },
  {
    title: "專業認證",
    subtitle: "AI 專家",
    description: "iPAS 考照與企業實戰，在職場中真正發揮 AI 實力",
    Icon: TrophyIcon,
  },
] as const;

export function AiLearningPath() {
  return (
    <div className="mt-5 rounded-xl border border-edge bg-page/70 px-4 py-5 md:px-5">
      <div className="flex items-center gap-2">
        <PathIcon />
        <p className="text-sm font-semibold text-ink">AI 成長路徑</p>
        <span className="text-xs text-muted">從新手小白到職場 AI 專家</span>
      </div>

      {/* Desktop: horizontal timeline */}
      <ol className="mt-5 hidden md:grid md:grid-cols-5 md:gap-2">
        {steps.map((step, idx) => (
          <li key={step.title} className="relative flex flex-col items-center text-center">
            {idx < steps.length - 1 ? (
              <span
                aria-hidden
                className="absolute left-[calc(50%+1.75rem)] top-5 h-px w-[calc(100%-3.5rem)] bg-gradient-to-r from-primary/40 to-primary/20"
              />
            ) : null}
            <span className="relative z-10 inline-flex size-10 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-primary">
              <step.Icon />
            </span>
            <p className="mt-2.5 text-xs font-semibold text-ink">{step.title}</p>
            <p className="mt-0.5 text-[11px] font-medium text-primary">{step.subtitle}</p>
            <p className="mt-1.5 text-[11px] leading-relaxed text-muted">{step.description}</p>
          </li>
        ))}
      </ol>

      {/* Mobile: vertical timeline */}
      <ol className="mt-4 space-y-0 md:hidden">
        {steps.map((step, idx) => (
          <li key={step.title} className="relative flex gap-3 pb-5 last:pb-0">
            {idx < steps.length - 1 ? (
              <span
                aria-hidden
                className="absolute left-5 top-10 bottom-0 w-px bg-gradient-to-b from-primary/30 to-primary/10"
              />
            ) : null}
            <span className="relative z-10 inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-primary">
              <step.Icon />
            </span>
            <div className="min-w-0 pt-1">
              <div className="flex flex-wrap items-baseline gap-x-2">
                <p className="text-sm font-semibold text-ink">{step.title}</p>
                <p className="text-xs font-medium text-primary">{step.subtitle}</p>
              </div>
              <p className="mt-1 text-xs leading-relaxed text-muted">{step.description}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

function PathIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-primary"
      aria-hidden
    >
      <circle cx="6" cy="19" r="3" />
      <path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15" />
      <circle cx="18" cy="5" r="3" />
    </svg>
  );
}

function SeedlingIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 22v-8" />
      <path d="M12 14c-4-2-6-5-6-9 4 0 6 2 6 6 0-4 2-6 6-6-0 4-2 7-6 9Z" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
      <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" />
    </svg>
  );
}

function WrenchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76Z" />
    </svg>
  );
}

function LayersIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="m12.83 2.18 8 3.5a1 1 0 0 1 0 1.84l-8 3.5a2 2 0 0 1-1.66 0l-8-3.5a1 1 0 0 1 0-1.84l8-3.5a2 2 0 0 1 1.66 0Z" />
      <path d="m2.5 12.5 8 3.5a2 2 0 0 0 1.66 0l8-3.5" />
      <path d="m2.5 17.5 8 3.5a2 2 0 0 0 1.66 0l8-3.5" />
    </svg>
  );
}

function TrophyIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20 17 22" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </svg>
  );
}
