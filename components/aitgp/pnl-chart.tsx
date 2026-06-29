"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CHART_TAB_ROUNDS,
  buildRoundHourGrid,
  buildSnapshotByHourKey,
  currentGridIndex,
  formatSnapshotLabel,
  pickAxisTicks,
  settledRoundTotals,
  type HourSlot,
  type HourlyRoundSnapshot,
} from "@/lib/aitgp-chart";
import {
  TEAMS,
  getRoundEntry,
  mainScore,
  sprintScore,
  type Team,
} from "@/lib/aitgp";
import { useAitgpPrices } from "@/components/aitgp/use-aitgp-prices";

type RaceType = "main" | "sprint";
type ChartScope = "cumulative" | string;

function formatPct(v: number) {
  return `${v > 0 ? "+" : ""}${v.toFixed(1)}%`;
}

/** 折線圖最前線：小賽車標記（側視、朝右） */
function ChartCarMarker({
  x,
  y,
  color,
  teamId,
  active,
}: {
  x: number;
  y: number;
  color: string;
  teamId: string;
  active: boolean;
}) {
  const scale = active ? 1.2 : 1;
  const gradId = `chart-car-${teamId.replace(/[^a-z0-9]/gi, "")}`;

  return (
    <g
      transform={`translate(${x}, ${y}) scale(${scale})`}
      aria-hidden
    >
      <g transform="translate(-14, -7)">
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="1" />
            <stop offset="100%" stopColor={color} stopOpacity="0.65" />
          </linearGradient>
        </defs>
        {/* 車身（車頭朝右） */}
        <path
          d="M27 10 L25 7 L21 6 L16 5.5 L12 6 L9 4.5 L4 5 L1 6.5 L1 10 L27 10 Z"
          fill={`url(#${gradId})`}
          stroke="#0b0b0e"
          strokeWidth="0.8"
          strokeLinejoin="round"
        />
        {/* 前翼（右） */}
        <path d="M28 9.5 L25 9.5 L25 7.5 L28 8 Z" fill={color} stroke="#0b0b0e" strokeWidth="0.5" />
        {/* 尾翼（左） */}
        <path d="M3 4 L1 3.5 L1 8 L3 8 Z" fill={color} stroke="#0b0b0e" strokeWidth="0.5" />
        {/* 座艙 */}
        <path d="M16 5.5 L14 3.5 L10 3.5 L11 5.5 Z" fill="#0b0b0e" opacity="0.85" />
        {/* 輪胎：右前、左後 */}
        <circle cx="22" cy="11" r="2.2" fill="#0b0b0e" />
        <circle cx="22" cy="11" r="0.9" fill={color} />
        <circle cx="7" cy="11" r="2.2" fill="#0b0b0e" />
        <circle cx="7" cy="11" r="0.9" fill={color} />
        {/* 車頭高光 */}
        <circle cx="25" cy="7" r="0.6" fill="white" opacity="0.55" />
      </g>
    </g>
  );
}

const VW = 880;
const VH = 360;
const PAD = { top: 28, right: 24, bottom: 52, left: 50 };
const PLOT_W = VW - PAD.left - PAD.right;
const PLOT_H = VH - PAD.top - PAD.bottom;

type ChartPoint = { idx: number; label: string; value: number };

type TeamSeries = {
  team: Team;
  badge: string;
  points: ChartPoint[];
};

function buildTeamSeriesOnGrid(
  grid: HourSlot[],
  roundId: string,
  race: RaceType,
  snapshots: HourlyRoundSnapshot[] | undefined,
  livePrices: Record<string, number> | undefined,
  valueOffset: (teamId: string) => number,
  maxIdx: number,
): TeamSeries[] {
  const field = race === "main" ? "main" : "sprint";
  const snapMap = buildSnapshotByHourKey(snapshots);

  return TEAMS.map((team, i) => {
    const points: ChartPoint[] = [];
    const entry = getRoundEntry(team.id, roundId);
    const offset = valueOffset(team.id);
    let lastValue: number | undefined;

    for (let idx = 0; idx <= maxIdx; idx++) {
      const slot = grid[idx];
      const snap = snapMap.get(slot.hourKey);
      let v = snap?.teams[team.id]?.[field];

      if (typeof v === "number") {
        lastValue = v;
      } else if (idx === maxIdx && entry && livePrices) {
        const live =
          race === "main" ? mainScore(entry, livePrices) : sprintScore(entry, livePrices);
        if (typeof live === "number") lastValue = live;
      }

      if (typeof lastValue === "number") {
        points.push({ idx, label: slot.label, value: lastValue + offset });
      }
    }

    // 賽期起點 0% 錨點，確保折線能從左側畫到目前位置
    if (points.length > 0 && points[0].idx > 0) {
      points.unshift({ idx: 0, label: grid[0].label, value: offset });
    }

    return { team, badge: `#${i + 1}`, points };
  });
}

function defaultScope(): ChartScope {
  const racing = CHART_TAB_ROUNDS.find((r) => r.status === "racing");
  return racing?.id ?? CHART_TAB_ROUNDS[0]?.id ?? "cumulative";
}

function scopeTitle(scope: ChartScope): string {
  if (scope === "cumulative") return "賽季累計盈虧";
  const round = CHART_TAB_ROUNDS.find((r) => r.id === scope);
  return round ? `${round.code} · ${round.name}` : scope;
}

export function PnlChart() {
  const { snapshot, loading } = useAitgpPrices();
  const [mounted, setMounted] = useState(false);
  const [scope, setScope] = useState<ChartScope>(defaultScope);
  const [race, setRace] = useState<RaceType>("main");
  const [hovered, setHovered] = useState<string | null>(null);
  const [pinned, setPinned] = useState<string | null>(null);
  const active = hovered ?? pinned;

  useEffect(() => {
    setMounted(true);
  }, []);

  const history = snapshot?.chartHistory ?? {};
  const livePrices = snapshot?.prices;

  const chartCtx = useMemo(() => {
    if (scope === "cumulative") {
      const racing = CHART_TAB_ROUNDS.find((r) => r.status === "racing" && r.id !== "warmup");
      if (!racing) return null;
      const totals = settledRoundTotals(history, race);
      return {
        grid: buildRoundHourGrid(racing),
        roundId: racing.id,
        snapshots: history[racing.id],
        valueOffset: (teamId: string) => totals[teamId] ?? 0,
      };
    }

    const round = CHART_TAB_ROUNDS.find((r) => r.id === scope);
    if (!round) return null;
    return {
      grid: buildRoundHourGrid(round),
      roundId: scope,
      snapshots: history[scope],
      valueOffset: () => 0,
    };
  }, [scope, race, history]);

  const grid = chartCtx?.grid ?? [];
  const maxIdx = useMemo(
    () => (mounted ? currentGridIndex(grid) : -1),
    [grid, mounted],
  );
  const axisTicks = useMemo(() => pickAxisTicks(grid), [grid]);
  const dayBoundaries = useMemo(() => {
    const out: number[] = [];
    let lastDay = "";
    for (const slot of grid) {
      if (slot.dayLabel !== lastDay) {
        out.push(slot.idx);
        lastDay = slot.dayLabel;
      }
    }
    return out;
  }, [grid]);

  const series = useMemo(() => {
    if (!chartCtx || maxIdx < 0) return [];
    return buildTeamSeriesOnGrid(
      chartCtx.grid,
      chartCtx.roundId,
      race,
      chartCtx.snapshots,
      livePrices,
      chartCtx.valueOffset,
      maxIdx,
    );
  }, [chartCtx, race, livePrices, maxIdx]);

  const allValues = series.flatMap((s) => s.points.map((p) => p.value));
  const hasData = allValues.length > 0;
  const gridReady = grid.length > 0 && maxIdx >= 0;

  const rawMin = hasData ? Math.min(0, ...allValues) : -5;
  const rawMax = hasData ? Math.max(0, ...allValues) : 5;
  const span = rawMax - rawMin || 10;
  const yMin = rawMin - span * 0.12;
  const yMax = rawMax + span * 0.12;

  const slotCount = Math.max(grid.length, 1);
  const xFor = (idx: number) =>
    PAD.left + (slotCount === 1 ? PLOT_W / 2 : (idx / (slotCount - 1)) * PLOT_W);
  const yFor = (v: number) => PAD.top + PLOT_H - ((v - yMin) / (yMax - yMin)) * PLOT_H;

  const yTicks = useMemo(() => {
    const count = 4;
    return Array.from({ length: count + 1 }, (_, k) => yMin + ((yMax - yMin) * k) / count);
  }, [yMin, yMax]);

  const isWarmupOnly =
    scope === "warmup" ||
    (scope === "cumulative" &&
      !CHART_TAB_ROUNDS.some((r) => r.id !== "warmup" && r.status === "racing"));

  const periodHint =
    scope === "cumulative"
      ? "進行中賽事"
      : (CHART_TAB_ROUNDS.find((r) => r.id === scope)?.tradingPeriod ?? "");

  return (
    <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-4 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="text-xs font-semibold text-zinc-300">{scopeTitle(scope)}</span>
          {snapshot?.updatedAt ? (
            <p className="mt-0.5 text-[10px] text-zinc-600" suppressHydrationWarning>
              行情每小時更新 · 最近 {formatSnapshotLabel(snapshot.updatedAt)}
              {periodHint ? ` · 賽期 ${periodHint}` : ""}
            </p>
          ) : loading || !mounted ? (
            <p className="mt-0.5 text-[10px] text-zinc-600">行情載入中…</p>
          ) : null}
        </div>

        <div className="inline-flex rounded-full border border-white/10 bg-white/5 p-0.5">
          {(["main", "sprint"] as RaceType[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setRace(t)}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                race === t
                  ? "bg-gradient-to-r from-rose-500 to-amber-500 text-white"
                  : "text-zinc-300 hover:text-white"
              }`}
            >
              {t === "main" ? "主賽 GP" : "副賽 Sprint"}
            </button>
          ))}
        </div>
      </div>

      <div className="-mx-1 mt-3 flex gap-1.5 overflow-x-auto px-1 pb-1">
        {CHART_TAB_ROUNDS.map((r) => (
          <button
            key={r.id}
            type="button"
            onClick={() => setScope(r.id)}
            className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
              scope === r.id
                ? "border-rose-400/60 bg-rose-500/15 text-rose-200"
                : "border-white/10 bg-white/5 text-zinc-400 hover:text-zinc-200"
            }`}
          >
            {r.code}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setScope("cumulative")}
          className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
            scope === "cumulative"
              ? "border-amber-400/60 bg-amber-500/15 text-amber-200"
              : "border-white/10 bg-white/5 text-zinc-400 hover:text-zinc-200"
          }`}
        >
          累計
        </button>
      </div>

      <p className="mt-3 text-xs text-zinc-500">
        {scope === "cumulative"
          ? `賽季累計${race === "main" ? "主賽盈虧" : "副賽漲跌"}（不含 GP0）· 時間軸依進行中賽事賽期預刻（週一至五 9:00–21:00，每小時一格）`
          : `${race === "main" ? "主賽盈虧率" : "副賽漲跌幅"} · 時間軸依本站賽期預刻（週一至五 9:00–21:00，每小時一格）`}
        {scope === "warmup" ? " · GP0 不計入賽季積分" : ""}
      </p>

      {!gridReady || !mounted ? (
        <div className="mt-4 flex h-48 items-center justify-center rounded-xl border border-dashed border-white/15 text-sm text-zinc-500">
          {!mounted || loading
            ? "載入行情中…"
            : scope === "cumulative" && isWarmupOnly
              ? "賽季開跑後，此處將顯示 R01 起的累計走勢。"
              : "此站尚未開賽，開賽後時間軸將從左側依小時推進。"}
        </div>
      ) : (
        <div className="mt-4 w-full overflow-x-auto">
          <svg
            viewBox={`0 0 ${VW} ${VH}`}
            className="h-auto w-full"
            style={{ minWidth: `${Math.max(640, slotCount * 5)}px` }}
            role="img"
            aria-label="各車隊盈虧走勢折線圖"
          >
            {dayBoundaries.map((idx) => (
              <line
                key={`day-${idx}`}
                x1={xFor(idx)}
                x2={xFor(idx)}
                y1={PAD.top}
                y2={VH - PAD.bottom}
                stroke="rgba(255,255,255,0.06)"
                strokeWidth={1}
              />
            ))}

            {yTicks.map((t, i) => {
              const y = yFor(t);
              const isZero = Math.abs(t) < 1e-9;
              return (
                <g key={i}>
                  <line
                    x1={PAD.left}
                    x2={VW - PAD.right}
                    y1={y}
                    y2={y}
                    stroke={isZero ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.08)"}
                    strokeWidth={isZero ? 1.2 : 1}
                    strokeDasharray={isZero ? "none" : "3 4"}
                  />
                  <text
                    x={PAD.left - 8}
                    y={y}
                    textAnchor="end"
                    dominantBaseline="central"
                    fontSize="11"
                    fill="#a1a1aa"
                  >
                    {`${t > 0 ? "+" : ""}${t.toFixed(0)}%`}
                  </text>
                </g>
              );
            })}

            {axisTicks.map(({ idx, label }) => (
              <text
                key={`${idx}-${label}`}
                x={xFor(idx)}
                y={VH - PAD.bottom + 20}
                textAnchor="middle"
                fontSize="10"
                fill="#d4d4d8"
              >
                {label}
              </text>
            ))}

            {maxIdx >= 0 ? (
              <line
                x1={xFor(maxIdx)}
                x2={xFor(maxIdx)}
                y1={PAD.top}
                y2={VH - PAD.bottom}
                stroke="rgba(251,191,36,0.35)"
                strokeWidth={1.5}
                strokeDasharray="4 3"
              />
            ) : null}

            {!hasData ? (
              <text x={VW / 2} y={VH / 2} textAnchor="middle" fontSize="12" fill="#71717a">
                時間軸已就緒 · 每小時更新後折線將由左向右延伸
              </text>
            ) : null}

            {series.map((s) => {
              if (s.points.length === 0) return null;
              const isActive = active === s.team.id;
              const dim = active !== null && !isActive;
              const opacity = dim ? 0.12 : 1;
              const path = s.points.map((p) => `${xFor(p.idx)},${yFor(p.value)}`).join(" ");
              return (
                <g
                  key={s.team.id}
                  style={{ opacity, transition: "opacity 0.2s" }}
                  onMouseEnter={() => setHovered(s.team.id)}
                  onMouseLeave={() => setHovered(null)}
                >
                  {s.points.length > 1 ? (
                    <polyline
                      points={path}
                      fill="none"
                      stroke={s.team.color}
                      strokeWidth={isActive ? 3.5 : 2}
                      strokeLinejoin="round"
                      strokeLinecap="round"
                    />
                  ) : null}
                  {s.points.map((p) => {
                    const px = xFor(p.idx);
                    const py = yFor(p.value);
                    const isLatest = p.idx === maxIdx;

                    return (
                      <g key={`${p.idx}-${p.label}`}>
                        {isLatest ? (
                          <ChartCarMarker
                            x={px}
                            y={py}
                            color={s.team.color}
                            teamId={s.team.id}
                            active={isActive}
                          />
                        ) : (
                          <circle
                            cx={px}
                            cy={py}
                            r={isActive ? 4 : 3}
                            fill={s.team.color}
                            stroke="#0b0b0e"
                            strokeWidth="1.2"
                          />
                        )}
                        {isActive ? (
                          <text
                            x={px}
                            y={py - (isLatest ? 16 : 11)}
                            textAnchor="middle"
                            fontSize="11"
                            fontWeight="700"
                            fill={p.value >= 0 ? "#34d399" : "#fb7185"}
                          >
                            {formatPct(p.value)}
                          </text>
                        ) : null}
                      </g>
                    );
                  })}
                </g>
              );
            })}
          </svg>
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-x-3 gap-y-2 border-t border-white/10 pt-3">
        {series.map((s) => {
          const isActive = active === s.team.id;
          const isPinned = pinned === s.team.id;
          const latest = s.points[s.points.length - 1];
          return (
            <button
              key={s.team.id}
              type="button"
              onMouseEnter={() => setHovered(s.team.id)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => setPinned(isPinned ? null : s.team.id)}
              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] transition ${
                isActive
                  ? "border-white/40 bg-white/10 text-white"
                  : "border-transparent text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <span className="size-2.5 rounded-full" style={{ backgroundColor: s.team.color }} />
              <span className="font-medium">{s.badge}</span>
              <span className="max-w-[7rem] truncate">{s.team.name}</span>
              {latest ? (
                <span className={latest.value >= 0 ? "text-emerald-400" : "text-rose-400"}>
                  {formatPct(latest.value)}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
