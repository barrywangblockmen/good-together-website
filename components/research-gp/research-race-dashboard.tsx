"use client";

import { useMemo, useState } from "react";
import {
  RESEARCH_PARTICIPANTS,
  RESEARCH_REPORT_ROUNDS,
  RESEARCH_REPORTS,
  RESEARCH_TOTAL_OPPORTUNITIES,
  researchDistancePct,
  type ResearchHorizon,
  type ResearchReport,
  type ResearchTarget,
} from "@/lib/research-gp";
import { useResearchRacePrices } from "@/components/research-gp/use-research-race-prices";

type HorizonFilter = "all" | ResearchHorizon;

type RankedOpportunity = {
  report: ResearchReport;
  target: ResearchTarget;
  actualPrice: number;
  distancePct: number;
  isLivePrice: boolean;
};

type RankedParticipant = RankedOpportunity & {
  rank: number;
};

const FILTERS: { id: HorizonFilter; label: string }[] = [
  { id: "all", label: "綜合最佳" },
  { id: 3, label: "3 個月" },
  { id: 6, label: "6 個月" },
];

function formatPrice(value: number, report: ResearchReport) {
  const digits = value >= 100 ? (Number.isInteger(value) ? 0 : 1) : value >= 10 ? 2 : 3;
  const formatted = new Intl.NumberFormat("zh-TW", {
    maximumFractionDigits: digits,
    minimumFractionDigits: value < 10 ? 2 : 0,
  }).format(value);
  return `${report.currency === "TWD" ? "NT$" : "$"}${formatted}${report.unit ? ` ${report.unit}` : ""}`;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("zh-TW", {
    timeZone: "Asia/Taipei",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(`${value}T00:00:00+08:00`));
}

function formatUpdatedAt(value: string) {
  return new Intl.DateTimeFormat("zh-TW", {
    timeZone: "Asia/Taipei",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(value));
}

function getActualPrice(
  report: ResearchReport,
  target: ResearchTarget,
  prices: Record<string, number>,
) {
  if (target.settledPrice != null) {
    return { price: target.settledPrice, isLivePrice: false };
  }
  const livePrice = prices[report.symbol];
  if (typeof livePrice === "number" && Number.isFinite(livePrice) && livePrice > 0) {
    return { price: livePrice, isLivePrice: true };
  }
  return { price: report.referencePrice, isLivePrice: false };
}

function targetStatus(target: ResearchTarget) {
  if (target.settledPrice != null) return "已開獎";
  return "追蹤中";
}

function Avatar({
  report,
  size = "md",
}: {
  report: Pick<ResearchReport, "analyst" | "initials" | "color">;
  size?: "sm" | "md" | "lg";
}) {
  const sizeClass = size === "lg" ? "size-14 text-lg" : size === "sm" ? "size-8 text-xs" : "size-10 text-sm";
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full border border-white/15 font-black text-white shadow-lg ${sizeClass}`}
      style={{
        background: `linear-gradient(145deg, ${report.color}, color-mix(in srgb, ${report.color} 52%, #111827))`,
        boxShadow: `0 0 24px color-mix(in srgb, ${report.color} 24%, transparent)`,
      }}
      aria-label={report.analyst}
    >
      {report.initials}
    </span>
  );
}

function RankBadge({ rank, color }: { rank: number; color: string }) {
  const medal =
    rank === 1
      ? "bg-amber-300 text-amber-950"
      : rank === 2
        ? "bg-slate-200 text-slate-800"
        : rank === 3
          ? "bg-orange-300 text-orange-950"
          : "border border-white/10 bg-white/5 text-slate-400";
  return (
    <span
      className={`inline-flex size-8 shrink-0 items-center justify-center rounded-lg text-xs font-black ${medal}`}
      style={rank > 3 ? { borderColor: `${color}44` } : undefined}
    >
      {rank}
    </span>
  );
}

export function ResearchRaceDashboard() {
  const [horizon, setHorizon] = useState<HorizonFilter>("all");
  const { snapshot, loading, error, refresh } = useResearchRacePrices();
  const prices = useMemo(() => snapshot?.prices ?? {}, [snapshot]);

  const opportunities = useMemo(() => {
    return RESEARCH_REPORTS.flatMap((report) =>
      report.targets
        .filter((target) => horizon === "all" || target.horizonMonths === horizon)
        .map((target): RankedOpportunity => {
          const actual = getActualPrice(report, target, prices);
          return {
            report,
            target,
            actualPrice: actual.price,
            distancePct: researchDistancePct(target.targetPrice, actual.price),
            isLivePrice: actual.isLivePrice,
          };
        }),
    );
  }, [horizon, prices]);

  const standings = useMemo(() => {
    const bestByParticipant = new Map<string, RankedOpportunity>();
    for (const opportunity of opportunities) {
      const current = bestByParticipant.get(opportunity.report.participantId);
      if (!current || opportunity.distancePct < current.distancePct) {
        bestByParticipant.set(opportunity.report.participantId, opportunity);
      }
    }
    return [...bestByParticipant.values()]
      .sort(
        (a, b) =>
          a.distancePct - b.distancePct ||
          a.report.analyst.localeCompare(b.report.analyst, "zh-Hant"),
      )
      .map((entry, index): RankedParticipant => ({ ...entry, rank: index + 1 }));
  }, [opportunities]);

  const rankByParticipant = useMemo(
    () => new Map(standings.map((entry) => [entry.report.participantId, entry.rank])),
    [standings],
  );

  const publishedOpportunities = RESEARCH_REPORTS.reduce(
    (total, report) => total + report.targets.length,
    0,
  );
  const liveSymbolCount = RESEARCH_REPORTS.filter(
    (report, index, reports) =>
      reports.findIndex((candidate) => candidate.symbol === report.symbol) === index &&
      typeof prices[report.symbol] === "number",
  ).length;

  return (
    <div className="min-h-screen bg-[#071116] text-slate-100">
      <section
        className="relative overflow-hidden border-b border-cyan-300/10"
        style={{
          backgroundImage:
            "radial-gradient(circle at 12% 15%, rgba(34,211,238,.16), transparent 34%), radial-gradient(circle at 88% 8%, rgba(251,191,36,.14), transparent 32%), linear-gradient(rgba(255,255,255,.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.025) 1px, transparent 1px)",
          backgroundSize: "auto, auto, 40px 40px, 40px 40px",
        }}
      >
        <div className="mx-auto max-w-7xl px-4 py-12 md:px-6 md:py-16">
          <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
            <div className="max-w-4xl">
              <div className="flex flex-wrap items-center gap-2 text-xs font-bold tracking-[0.18em]">
                <span className="rounded-full bg-cyan-300 px-3 py-1 text-[#071116]">
                  GT RESEARCH GRAND PRIX
                </span>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-slate-300">
                  2026 首屆目標價大賞
                </span>
              </div>
              <h1 className="mt-5 text-4xl font-black tracking-[-0.04em] text-white md:text-6xl">
                誰的目標價
                <span className="block text-cyan-300">最接近市場？</span>
              </h1>
              <p className="mt-5 max-w-3xl text-base leading-7 text-slate-300 md:text-lg">
                8 位研究員、每人 3 份報告、每份 3／6 個月雙目標。每天以最新實際價格重算距離，每人只帶自己最準的一次進入總榜。
              </p>
            </div>

            <div className="min-w-[270px] rounded-2xl border border-cyan-300/20 bg-black/25 p-4 backdrop-blur">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-cyan-300">
                    Market feed
                  </p>
                  <p className="mt-1 text-sm font-semibold text-white">
                    {loading
                      ? "正在同步行情…"
                      : snapshot
                        ? `${liveSymbolCount}/8 個標的已更新`
                        : "使用報告基準價暫算"}
                  </p>
                </div>
                <span className="relative flex size-3">
                  <span
                    className={`absolute inline-flex size-full rounded-full ${
                      snapshot ? "animate-ping bg-emerald-400 motion-reduce:animate-none" : "bg-amber-400"
                    } opacity-60`}
                  />
                  <span
                    className={`relative inline-flex size-3 rounded-full ${
                      snapshot ? "bg-emerald-400" : "bg-amber-400"
                    }`}
                  />
                </span>
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3 text-xs text-slate-400">
                <span>{snapshot ? formatUpdatedAt(snapshot.updatedAt) : "等待首次行情"}</span>
                <button
                  type="button"
                  onClick={() => void refresh()}
                  disabled={loading}
                  className="rounded-full border border-white/10 px-3 py-1.5 font-semibold text-slate-200 transition hover:border-cyan-300/50 hover:text-cyan-200 disabled:cursor-wait disabled:opacity-50"
                >
                  重新整理
                </button>
              </div>
              {error ? (
                <p className="mt-2 text-xs text-amber-300">
                  行情暫時無法更新，保留最近一次資料；缺漏標的以基準價暫算。
                </p>
              ) : null}
            </div>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-4">
            {[
              { value: "8", label: "位參賽研究員" },
              { value: `${publishedOpportunities}/${RESEARCH_TOTAL_OPPORTUNITIES}`, label: "機會已發布" },
              { value: "6", label: "每人最多機會" },
              { value: "10.20", label: "首批開獎起跑" },
            ].map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-4">
                <p className="text-2xl font-black tracking-tight text-white md:text-3xl">{stat.value}</p>
                <p className="mt-1 text-xs text-slate-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-7xl space-y-14 px-4 py-12 md:px-6 md:py-16">
        <section aria-labelledby="live-standings">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">Live standings</p>
              <h2 id="live-standings" className="mt-2 text-3xl font-black tracking-tight text-white">
                今日暫定頒獎台
              </h2>
              <p className="mt-2 text-sm text-slate-400">距離越小越準；同一位參賽者只保留最佳一次。</p>
            </div>
            <div className="inline-flex w-fit rounded-full border border-white/10 bg-white/[0.04] p-1">
              {FILTERS.map((filter) => (
                <button
                  key={filter.id}
                  type="button"
                  onClick={() => setHorizon(filter.id)}
                  className={`rounded-full px-4 py-2 text-xs font-bold transition ${
                    horizon === filter.id
                      ? "bg-cyan-300 text-[#071116]"
                      : "text-slate-400 hover:text-white"
                  }`}
                  aria-pressed={horizon === filter.id}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-7 grid gap-4 md:grid-cols-3">
            {standings.slice(0, 3).map((entry) => (
              <article
                key={entry.report.participantId}
                className={`relative overflow-hidden rounded-3xl border p-5 ${
                  entry.rank === 1
                    ? "border-amber-300/40 bg-gradient-to-br from-amber-300/15 via-white/[0.05] to-transparent"
                    : "border-white/10 bg-white/[0.04]"
                }`}
              >
                <span
                  className="absolute -right-8 -top-10 size-28 rounded-full opacity-15 blur-2xl"
                  style={{ backgroundColor: entry.report.color }}
                  aria-hidden
                />
                <div className="relative flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <RankBadge rank={entry.rank} color={entry.report.color} />
                    <Avatar report={entry.report} size="lg" />
                  </div>
                  <span className="rounded-full border border-white/10 bg-black/20 px-2.5 py-1 text-[10px] font-bold text-slate-300">
                    {targetStatus(entry.target)}
                  </span>
                </div>
                <div className="relative mt-5">
                  <h3 className="text-lg font-black text-white">{entry.report.analyst}</h3>
                  <p className="mt-1 text-sm text-slate-400">
                    {entry.report.instrument} · {entry.report.displaySymbol}
                  </p>
                  <div className="mt-5 flex items-end justify-between gap-4">
                    <div>
                      <p className="text-xs text-slate-500">目前誤差</p>
                      <p className="mt-1 text-4xl font-black tracking-[-0.04em] text-cyan-300">
                        {entry.distancePct.toFixed(2)}
                        <span className="ml-0.5 text-base">%</span>
                      </p>
                    </div>
                    <div className="text-right text-xs">
                      <p className="text-slate-500">
                        {entry.target.horizonMonths} 個月目標
                      </p>
                      <p className="mt-1 font-bold text-white">
                        {formatPrice(entry.target.targetPrice, entry.report)}
                      </p>
                    </div>
                  </div>
                  <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.max(3, 100 - Math.min(entry.distancePct, 50) * 2)}%`,
                        backgroundColor: entry.report.color,
                      }}
                    />
                  </div>
                  <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
                    <span>
                      實際 {formatPrice(entry.actualPrice, entry.report)}
                      {!entry.isLivePrice ? "（基準）" : ""}
                    </span>
                    <span>{formatDate(entry.target.resolveDate)} 開獎</span>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-5 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.035]">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-white/10 text-[11px] uppercase tracking-[0.14em] text-slate-500">
                    <th className="px-5 py-4 font-bold">名次</th>
                    <th className="px-5 py-4 font-bold">研究員</th>
                    <th className="px-5 py-4 font-bold">最佳機會</th>
                    <th className="px-5 py-4 text-right font-bold">實際價格</th>
                    <th className="px-5 py-4 text-right font-bold">目標價</th>
                    <th className="px-5 py-4 text-right font-bold">誤差</th>
                    <th className="px-5 py-4 text-right font-bold">開獎日</th>
                  </tr>
                </thead>
                <tbody>
                  {standings.map((entry) => (
                    <tr
                      key={entry.report.participantId}
                      className="border-b border-white/[0.06] last:border-0 hover:bg-white/[0.035]"
                    >
                      <td className="px-5 py-4">
                        <RankBadge rank={entry.rank} color={entry.report.color} />
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar report={entry.report} size="sm" />
                          <div>
                            <p className="font-bold text-white">{entry.report.analyst}</p>
                            <p className="text-xs text-slate-500">{entry.report.rating}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-semibold text-slate-200">
                          {entry.report.instrument} · {entry.target.horizonMonths} 個月
                        </p>
                        <p className="text-xs text-slate-500">{entry.report.displaySymbol}</p>
                      </td>
                      <td className="px-5 py-4 text-right text-sm text-slate-300">
                        {formatPrice(entry.actualPrice, entry.report)}
                      </td>
                      <td className="px-5 py-4 text-right text-sm font-bold text-white">
                        {formatPrice(entry.target.targetPrice, entry.report)}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-black ${
                            entry.distancePct < 5
                              ? "bg-emerald-400/15 text-emerald-300"
                              : entry.distancePct < 15
                                ? "bg-cyan-300/15 text-cyan-200"
                                : "bg-amber-300/15 text-amber-200"
                          }`}
                        >
                          {entry.distancePct.toFixed(2)}%
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right text-xs text-slate-400">
                        {formatDate(entry.target.resolveDate)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section aria-labelledby="opportunity-matrix">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">Opportunity matrix</p>
            <h2 id="opportunity-matrix" className="mt-2 text-3xl font-black tracking-tight text-white">
              每人六次機會
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
              每一格都是獨立預測。第 2、3 份報告發布後，系統會自動從該參賽者最多六個目標中挑出誤差最小的一格。
            </p>
          </div>

          <div className="mt-7 grid gap-4 lg:grid-cols-2">
            {RESEARCH_PARTICIPANTS.map((participant) => {
              const participantReports = RESEARCH_REPORTS.filter(
                (report) => report.participantId === participant.id,
              );
              const firstReport = participantReports[0];
              const rank = rankByParticipant.get(participant.id) ?? 0;
              return (
                <article
                  key={participant.id}
                  className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.035]"
                >
                  <div className="flex items-center justify-between gap-4 border-b border-white/10 px-5 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar report={participant} />
                      <div>
                        <h3 className="font-black text-white">{participant.analyst}</h3>
                        <p className="text-xs text-slate-500">
                          {firstReport.instrument} · {firstReport.displaySymbol}
                        </p>
                      </div>
                    </div>
                    {rank ? <RankBadge rank={rank} color={participant.color} /> : null}
                  </div>

                  <div className="divide-y divide-white/[0.07]">
                    {RESEARCH_REPORT_ROUNDS.map((round) => {
                      const report = participantReports.find((candidate) => candidate.roundId === round.id);
                      return (
                        <div key={round.id} className="grid grid-cols-[86px_1fr] gap-3 px-5 py-4">
                          <div>
                            <p className="text-xs font-black text-slate-300">{round.label}</p>
                            <p className="mt-1 text-[10px] text-slate-600">{round.monthLabel}</p>
                          </div>
                          {report ? (
                            <div className="grid grid-cols-2 gap-2">
                              {report.targets.map((target) => {
                                const actual = getActualPrice(report, target, prices);
                                const distance = researchDistancePct(target.targetPrice, actual.price);
                                return (
                                  <div
                                    key={target.horizonMonths}
                                    className="rounded-xl border border-white/[0.08] bg-black/15 px-3 py-2.5"
                                  >
                                    <div className="flex items-center justify-between gap-2">
                                      <span className="text-[10px] font-bold text-slate-500">
                                        {target.horizonMonths} 個月
                                      </span>
                                      <span className="text-[10px] font-black text-cyan-300">
                                        {distance.toFixed(1)}%
                                      </span>
                                    </div>
                                    <p className="mt-1 text-sm font-black text-white">
                                      {formatPrice(target.targetPrice, report)}
                                    </p>
                                    <p className="mt-1 text-[10px] text-slate-600">
                                      {formatDate(target.resolveDate)}
                                    </p>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <div className="grid grid-cols-2 gap-2">
                              {[3, 6].map((months) => (
                                <div
                                  key={months}
                                  className="rounded-xl border border-dashed border-white/10 px-3 py-2.5 text-slate-600"
                                >
                                  <p className="text-[10px] font-bold">{months} 個月</p>
                                  <p className="mt-1 text-sm font-semibold">待繳交</p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section aria-labelledby="race-rules" className="pb-4">
          <div className="rounded-3xl border border-cyan-300/15 bg-gradient-to-br from-cyan-300/[0.08] via-white/[0.03] to-amber-300/[0.06] p-6 md:p-8">
            <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">How it works</p>
                <h2 id="race-rules" className="mt-2 text-3xl font-black tracking-tight text-white">
                  五步決定最準研究員
                </h2>
              </div>
              <div className="rounded-full border border-amber-300/30 bg-amber-300/10 px-4 py-2 text-xs font-black text-amber-200">
                同一人最多獲得一個獎項
              </div>
            </div>
            <ol className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {[
                ["01", "每月交一份", "每人共 3 份研究報告"],
                ["02", "一份雙目標", "3 個月與 6 個月各一價"],
                ["03", "行情每日重算", "以最新實際價格計算誤差"],
                ["04", "自己先比自己", "六次機會只留下最準一次"],
                ["05", "全場排前三", "8 人各一席，頒出 1～3 名"],
              ].map(([number, title, body]) => (
                <li key={number} className="rounded-2xl border border-white/10 bg-black/15 p-4">
                  <span className="font-mono text-xs font-black text-cyan-300">{number}</span>
                  <h3 className="mt-3 text-sm font-black text-white">{title}</h3>
                  <p className="mt-1 text-xs leading-5 text-slate-400">{body}</p>
                </li>
              ))}
            </ol>
            <div className="mt-6 border-t border-white/10 pt-5 text-xs leading-5 text-slate-500">
              誤差公式：|目標價 − 實際價格| ÷ 實際價格 × 100%。開獎以到期日收盤價為準；遇非交易日則採下一個可取得的正式收盤價。到期價格鎖定後不再隨行情變動。此頁為競賽紀錄，不構成投資建議。
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
