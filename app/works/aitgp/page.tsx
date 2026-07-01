import { Reveal } from "@/components/motion/reveal";
import { PnlChart } from "@/components/aitgp/pnl-chart";
import { SeasonLeaderboard } from "@/components/aitgp/season-leaderboard";
import { TeamsSection } from "@/components/aitgp/teams-section";
import { createMetadata } from "@/lib/metadata";
import {
  ANNUAL_AWARDS,
  INSTRUMENT_RULES,
  MAIN_PRIZES,
  POINTS_NOTE,
  POINTS_TABLE,
  RACE_FORMATS,
  ROUND_RULES,
  RULES_DISCLAIMER,
  ROUNDS,
  SEASON_KICKOFF,
  SEASON_LABEL,
  getSeasonStandings,
} from "@/lib/aitgp";

export const metadata = createMetadata({
  title: "AITGP 交易大獎賽",
  description:
    "AI Trading Grand Prix（AITGP）把 F1 賽車的車隊、站次與積分精神帶進交易場。查看各車隊每一站選定的標的、做多做空方向與當前盈虧戰況看板。",
  path: "/works/aitgp",
});

export default function AitgpPage() {
  const standings = getSeasonStandings();

  return (
    <div className="bg-[#0b0b0e] text-zinc-100">
      {/* Hero */}
      <section className="aitgp-track-bg relative overflow-hidden border-b border-white/10">
        <div className="relative mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-24">
          <Reveal>
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-rose-500 to-amber-500 px-3 py-1 text-xs font-bold tracking-wider text-white">
                AI TRADING GRAND PRIX
              </span>
              <span className="text-xs font-medium tracking-[0.3em] text-zinc-400">{SEASON_LABEL}</span>
            </div>
            <h1 className="mt-5 text-4xl font-black tracking-tight text-white md:text-6xl">
              AITGP 交易大獎賽
            </h1>
            <p className="mt-5 max-w-3xl text-pretty text-base leading-relaxed text-zinc-300 md:text-lg">
              把 F1 賽車的「站次、車隊、積分」精神帶進交易場。每位參賽者用 AI 打造自己的車隊，每一站選定標的、真實下單、固定回顧。比的不只是賺賠，更是交易紀律、選股眼光與作品呈現力。
            </p>
            <p className="mt-7 text-xs text-zinc-500">
              賽季開跑：{SEASON_KICKOFF}　·　主辦：GT Club
            </p>
          </Reveal>
        </div>
        <div className="aitgp-checker h-2 w-full" aria-hidden />
      </section>

      {/* 賽季積分榜 */}
      <section id="standings" className="border-b border-white/10">
        <div className="mx-auto max-w-6xl px-4 py-14 md:px-6 md:py-16">
          <Reveal>
            <SectionTitle eyebrow="Live P/L Chart" title="各車隊盈虧走勢" />
            <div className="mt-6">
              <PnlChart />
            </div>
          </Reveal>

          <Reveal>
            <div className="mt-12">
              <SectionTitle eyebrow="Championship Standings" title="賽季積分榜" />
              <div className="mt-6">
                <SeasonLeaderboard standings={standings} />
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 參賽車隊 + 各站標的與盈虧 */}
      <section className="border-b border-white/10">
        <div className="mx-auto max-w-6xl px-4 py-14 md:px-6 md:py-16">
          <Reveal>
            <SectionTitle eyebrow="The Grid · 8 Teams" title="參賽車隊" />
            <p className="mt-2 max-w-2xl text-sm text-zinc-400">
              切換站次，查看每支車隊的賽車、主賽（可做多／做空，標的可重複）與副賽（只做多、先喊先贏）標的及盈虧。
            </p>
            <div className="mt-6">
              <TeamsSection />
            </div>
          </Reveal>
        </div>
      </section>

      {/* 規則摘要 */}
      <section>
        <div className="mx-auto max-w-6xl px-4 py-14 md:px-6 md:py-20">
          <Reveal>
            <SectionTitle eyebrow="Rules & Rewards" title="賽制與獎勵" />
          </Reveal>

          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {RACE_FORMATS.map((f, i) => (
              <Reveal key={f.key} delay={0.05 * i}>
                <div className="h-full rounded-2xl border border-white/10 bg-zinc-900/60 p-6">
                  <span className="inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-amber-300">
                    {f.badge}
                  </span>
                  <h3 className="mt-3 text-lg font-semibold text-white">
                    {f.title}
                    <span className="ml-2 text-xs font-normal text-zinc-400">比 {f.skill}</span>
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-400">{f.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal>
            <div className="mt-5 rounded-2xl border border-amber-500/25 bg-amber-500/5 px-5 py-5">
              <h3 className="text-sm font-semibold text-amber-200">{INSTRUMENT_RULES.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-300">{INSTRUMENT_RULES.summary}</p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-emerald-400/90">
                    允許
                  </p>
                  <ul className="mt-2 space-y-1.5">
                    {INSTRUMENT_RULES.allowed.map((item) => (
                      <li key={item} className="text-sm leading-relaxed text-zinc-400">
                        · {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-rose-400/90">
                    禁止
                  </p>
                  <ul className="mt-2 space-y-1.5">
                    {INSTRUMENT_RULES.prohibited.map((item) => (
                      <li key={item} className="text-sm leading-relaxed text-zinc-400">
                        · {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-zinc-400">{INSTRUMENT_RULES.leverageNote}</p>
              <p className="mt-2 text-sm leading-relaxed text-zinc-500">{INSTRUMENT_RULES.violation}</p>
            </div>
          </Reveal>

          <Reveal>
            <ul className="mt-5 space-y-2 rounded-2xl border border-white/10 bg-zinc-900/40 px-5 py-4">
              {ROUND_RULES.map((rule) => (
                <li key={rule} className="text-sm leading-relaxed text-zinc-400">
                  · {rule}
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal>
            <div className="mt-5 rounded-2xl border border-white/10 bg-zinc-900/40 px-5 py-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                {RULES_DISCLAIMER.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-500">{RULES_DISCLAIMER.body}</p>
            </div>
          </Reveal>

          <div className="mt-5 grid gap-5 md:grid-cols-3">
            <Reveal>
              <div className="h-full rounded-2xl border border-white/10 bg-zinc-900/60 p-6">
                <h3 className="text-sm font-semibold text-white">每站主賽獎金</h3>
                <p className="mt-1 text-xs text-zinc-500">總額 50 USDT</p>
                <ul className="mt-3 space-y-2">
                  {MAIN_PRIZES.map((p) => (
                    <li key={p.place} className="flex items-center justify-between text-sm">
                      <span className="text-zinc-300">{p.place}</span>
                      <span className="font-semibold text-amber-300">{p.reward}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>

            <Reveal delay={0.05}>
              <div className="h-full rounded-2xl border border-white/10 bg-zinc-900/60 p-6">
                <h3 className="text-sm font-semibold text-white">賽季積分表</h3>
                <p className="mt-1 text-xs text-zinc-500">{POINTS_NOTE}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {POINTS_TABLE.map((pt, idx) => (
                    <span
                      key={idx}
                      className="inline-flex flex-col items-center rounded-md border border-white/10 bg-white/5 px-2 py-1"
                    >
                      <span className="text-[10px] text-zinc-500">P{idx + 1}</span>
                      <span className="text-xs font-bold text-white">{pt}</span>
                    </span>
                  ))}
                </div>
              </div>
            </Reveal>

            <Reveal delay={0.1}>
              <div className="h-full rounded-2xl border border-white/10 bg-zinc-900/60 p-6">
                <h3 className="text-sm font-semibold text-white">年度獎項</h3>
                <ul className="mt-3 space-y-2">
                  {ANNUAL_AWARDS.map((a) => (
                    <li key={a.title} className="text-sm">
                      <span className="font-medium text-zinc-200">{a.title}</span>
                      <span className="ml-1 text-xs text-zinc-500">· {a.desc}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>

          <Reveal>
            <div className="mt-8 rounded-2xl border border-white/10 bg-zinc-900/40 p-6">
              <h3 className="text-sm font-semibold text-white">賽季賽程 · 對齊 2026 F1</h3>
              <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {ROUNDS.map((r) => (
                  <div
                    key={r.id}
                    className="rounded-lg border border-white/10 bg-black/20 px-3 py-2.5"
                  >
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] font-bold text-amber-300">
                        {r.code}
                      </span>
                      <span className="truncate text-sm font-medium text-zinc-200">{r.name}</span>
                    </div>
                    <p className="mt-1 text-[11px] text-zinc-500">
                      {r.tradingPeriod} · {r.settleDate}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}

function SectionTitle({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-rose-400">{eyebrow}</p>
      <h2 className="mt-2 text-2xl font-bold tracking-tight text-white md:text-3xl">{title}</h2>
    </div>
  );
}
