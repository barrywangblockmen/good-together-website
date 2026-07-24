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
type RankingMode = "live" | "settled";
type PeriodFilter = "all" | ResearchReport["roundId"];

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
  { id: "all", label: "全部期限" },
  { id: 3, label: "3 個月" },
  { id: 6, label: "6 個月" },
];

const RANKING_MODES: {
  id: RankingMode;
  label: string;
  description: string;
}[] = [
  {
    id: "live",
    label: "即時追蹤榜",
    description: "依最新市場價格動態估算，呈現目前領先態勢",
  },
  {
    id: "settled",
    label: "正式結算榜",
    description: "僅納入已到期並完成價格封存的有效預測",
  },
];

const PERIOD_FILTERS: { id: PeriodFilter; label: string }[] = [
  { id: "all", label: "全部期別" },
  ...RESEARCH_REPORT_ROUNDS.map((round) => ({
    id: round.id,
    label: round.monthLabel.replace("2026 年 ", ""),
  })),
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
  if (target.settledPrice != null) return "已結算";
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
  const [rankingMode, setRankingMode] = useState<RankingMode>("live");
  const [period, setPeriod] = useState<PeriodFilter>("all");
  const [horizon, setHorizon] = useState<HorizonFilter>("all");
  const { snapshot, loading, error, refresh } = useResearchRacePrices();
  const prices = useMemo(() => snapshot?.prices ?? {}, [snapshot]);

  const opportunities = useMemo(() => {
    return RESEARCH_REPORTS.flatMap((report) =>
      report.targets
        .filter(
          (target) =>
            (period === "all" || report.roundId === period) &&
            (horizon === "all" || target.horizonMonths === horizon) &&
            (rankingMode === "live" || target.settledPrice != null),
        )
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
  }, [horizon, period, prices, rankingMode]);

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
                  GT PREDICTION MARKET
                </span>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-slate-300">
                  2026 年度市場預測賽
                </span>
              </div>
              <h1 className="mt-5 text-4xl font-black tracking-[-0.04em] text-white md:text-6xl">
                GT
                <span className="block text-cyan-300">預測市場</span>
              </h1>
              <p className="mt-5 max-w-3xl text-base leading-7 text-slate-300 md:text-lg">
                本賽事採絕對百分比誤差（APE）作為統一評分標準，跨市場比較不同預測週期的價格判斷。排名隨市場行情更新，最終成績以各預測結算日的正式收盤價封存。
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
              { value: "8", label: "位參賽者" },
              {
                value: `${publishedOpportunities}/${RESEARCH_TOTAL_OPPORTUNITIES}`,
                label: "有效預測已發布",
              },
              { value: "6", label: "每人預測席次" },
              { value: "10.20", label: "首批預測結算" },
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
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">
                Competition standings
              </p>
              <h2 id="live-standings" className="mt-2 text-3xl font-black tracking-tight text-white">
                {rankingMode === "live" ? "即時追蹤排名" : "正式結算排名"}
              </h2>
              <p className="mt-2 text-sm text-slate-400">
                {rankingMode === "live"
                  ? "每位參賽者以目前最精準的一筆有效預測進榜；此排名隨市場行情變動。"
                  : "每位參賽者以已完成結算的最佳成績進榜，結算價格封存後不再變動。"}
              </p>
            </div>
          </div>

          <div className="mt-7 grid gap-3 md:grid-cols-2">
            {RANKING_MODES.map((mode) => (
              <button
                key={mode.id}
                type="button"
                onClick={() => setRankingMode(mode.id)}
                className={`rounded-2xl border px-5 py-4 text-left transition ${
                  rankingMode === mode.id
                    ? "border-cyan-300/50 bg-cyan-300/10"
                    : "border-white/10 bg-white/[0.03] hover:border-white/20"
                }`}
                aria-pressed={rankingMode === mode.id}
              >
                <span
                  className={`text-sm font-black ${
                    rankingMode === mode.id ? "text-cyan-200" : "text-white"
                  }`}
                >
                  {mode.label}
                </span>
                <span className="mt-1 block text-xs leading-5 text-slate-500">
                  {mode.description}
                </span>
              </button>
            ))}
          </div>

          <div className="mt-4 flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.025] p-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
                預測期別
              </span>
              {PERIOD_FILTERS.map((filter) => (
                <button
                  key={filter.id}
                  type="button"
                  onClick={() => setPeriod(filter.id)}
                  className={`rounded-full px-4 py-2 text-xs font-bold transition ${
                    period === filter.id
                      ? "bg-cyan-300 text-[#071116]"
                      : "text-slate-400 hover:text-white"
                  }`}
                  aria-pressed={period === filter.id}
                >
                  {filter.label}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
                預測期限
              </span>
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

          {standings.length > 0 ? (
            <>
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
                      <p className="text-xs text-slate-500">
                        {rankingMode === "live" ? "即時相對誤差" : "正式相對誤差"}
                      </p>
                      <p className="mt-1 text-4xl font-black tracking-[-0.04em] text-cyan-300">
                        {entry.distancePct.toFixed(2)}
                        <span className="ml-0.5 text-base">%</span>
                      </p>
                    </div>
                    <div className="text-right text-xs">
                      <p className="text-slate-500">
                        {entry.target.horizonMonths} 個月預測
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
                      {rankingMode === "live" ? "市場價格 " : "結算價格 "}
                      {formatPrice(entry.actualPrice, entry.report)}
                      {rankingMode === "live" && !entry.isLivePrice ? "（基準）" : ""}
                    </span>
                    <span>{formatDate(entry.target.resolveDate)} 結算</span>
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
                    <th className="px-5 py-4 font-bold">參賽者</th>
                    <th className="px-5 py-4 font-bold">個人最佳預測</th>
                    <th className="px-5 py-4 text-right font-bold">
                      {rankingMode === "live" ? "市場價格" : "結算價格"}
                    </th>
                    <th className="px-5 py-4 text-right font-bold">預測價格</th>
                    <th className="px-5 py-4 text-right font-bold">誤差</th>
                    <th className="px-5 py-4 text-right font-bold">結算日</th>
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
            </>
          ) : (
            <div className="mt-7 rounded-3xl border border-dashed border-cyan-300/25 bg-cyan-300/[0.04] px-6 py-12 text-center">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-300">
                {rankingMode === "settled" ? "Official results pending" : "Forecasts pending"}
              </p>
              <h3 className="mt-3 text-xl font-black text-white">
                {rankingMode === "settled"
                  ? "正式結算榜將於首批預測到期後啟用"
                  : "此篩選條件尚無已發布的預測"}
              </h3>
              <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-400">
                {rankingMode === "settled"
                  ? "首批預測自 2026 年 10 月 20 日起陸續結算。主辦單位完成正式價格封存後，成績將自動納入本榜。"
                  : "待該期預測正式發布後，系統將依目前選擇的期限自動產生排名。"}
              </p>
              <button
                type="button"
                onClick={() => {
                  if (rankingMode === "settled") {
                    setRankingMode("live");
                  } else {
                    setPeriod("all");
                    setHorizon("all");
                  }
                }}
                className="mt-6 rounded-full bg-cyan-300 px-5 py-2.5 text-xs font-black text-[#071116] transition hover:bg-cyan-200"
              >
                {rankingMode === "settled" ? "查看即時追蹤榜" : "查看全部已發布預測"}
              </button>
            </div>
          )}
        </section>

        <section aria-labelledby="opportunity-matrix">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">
              Forecast portfolio
            </p>
            <h2 id="opportunity-matrix" className="mt-2 text-3xl font-black tracking-tight text-white">
              預測組合總覽
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
              每一期可選擇不同市場標的；標的與預測期限皆以單份預測為單位呈現。榜單只採計每位參賽者在目前篩選條件下的最佳成績。
            </p>
          </div>

          <div className="mt-7 grid gap-4 lg:grid-cols-2">
            {RESEARCH_PARTICIPANTS.map((participant) => {
              const participantReports = RESEARCH_REPORTS.filter(
                (report) => report.participantId === participant.id,
              );
              const rank = rankByParticipant.get(participant.id) ?? 0;
              const publishedTargetCount = participantReports.reduce(
                (total, report) => total + report.targets.length,
                0,
              );
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
                          {participantReports.length}/3 期 · {publishedTargetCount}/6 筆預測已發布
                        </p>
                      </div>
                    </div>
                    {rank ? <RankBadge rank={rank} color={participant.color} /> : null}
                  </div>

                  <div className="divide-y divide-white/[0.07]">
                    {RESEARCH_REPORT_ROUNDS.map((round) => {
                      const report = participantReports.find((candidate) => candidate.roundId === round.id);
                      return (
                        <div
                          key={round.id}
                          className="grid gap-3 px-5 py-4 sm:grid-cols-[82px_150px_1fr] sm:items-center"
                        >
                          <div>
                            <p className="text-xs font-black text-slate-300">{round.label}</p>
                            <p className="mt-1 text-[10px] text-slate-600">{round.monthLabel}</p>
                          </div>
                          {report ? (
                            <>
                              <div className="rounded-xl bg-white/[0.035] px-3 py-2.5">
                                <p className="text-sm font-black text-white">{report.instrument}</p>
                                <p className="mt-0.5 text-[10px] font-semibold text-cyan-300">
                                  {report.displaySymbol}
                                </p>
                                <p className="mt-1 text-[10px] text-slate-500">{report.rating}</p>
                              </div>
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
                            </>
                          ) : (
                            <>
                              <div className="rounded-xl border border-dashed border-white/10 px-3 py-2.5 text-slate-600">
                                <p className="text-xs font-bold">標的待公布</p>
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                {[3, 6].map((months) => (
                                  <div
                                    key={months}
                                    className="rounded-xl border border-dashed border-white/10 px-3 py-2.5 text-slate-600"
                                  >
                                    <p className="text-[10px] font-bold">{months} 個月</p>
                                    <p className="mt-1 text-sm font-semibold">尚未發布</p>
                                  </div>
                                ))}
                              </div>
                            </>
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
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">
                  Official methodology
                </p>
                <h2 id="race-rules" className="mt-2 text-3xl font-black tracking-tight text-white">
                  標準化評選機制
                </h2>
              </div>
              <div className="rounded-full border border-amber-300/30 bg-amber-300/10 px-4 py-2 text-xs font-black text-amber-200">
                個人最佳成績制 · 每人限一席獎項
              </div>
            </div>
            <ol className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {[
                ["01", "定期提交", "每位參賽者完成 3 個預測週期"],
                ["02", "雙期限預測", "每份報告提交 3／6 個月預測價格"],
                ["03", "即時追蹤", "依最新市場價格呈現暫定領先態勢"],
                ["04", "正式結算", "到期後以正式價格封存單筆預測成績"],
                ["05", "唯一獎項", "每人採個人最佳成績競逐全場前 3 名"],
              ].map(([number, title, body]) => (
                <li key={number} className="rounded-2xl border border-white/10 bg-black/15 p-4">
                  <span className="font-mono text-xs font-black text-cyan-300">{number}</span>
                  <h3 className="mt-3 text-sm font-black text-white">{title}</h3>
                  <p className="mt-1 text-xs leading-5 text-slate-400">{body}</p>
                </li>
              ))}
            </ol>
            <div className="mt-6 border-t border-white/10 pt-5 text-xs leading-5 text-slate-500">
              評分指標採絕對百分比誤差（Absolute Percentage Error, APE）：|預測價格 − 結算價格| ÷ 結算價格 × 100%。數值越低代表預測越精準。即時追蹤榜僅呈現市場動態，不代表正式名次；正式結算榜只納入已到期並封存的預測。結算日遇非交易日，採下一個可取得的正式收盤價。本頁僅供賽事紀錄與交流，不構成投資建議。
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
