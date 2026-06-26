"use client";

import { useMemo, useState } from "react";
import { CHART_ROUNDS, TEAMS, getRoundEntry, mainScore, sprintScore } from "@/lib/aitgp";

type RaceType = "main" | "sprint";

function formatPct(v: number) {
  return `${v > 0 ? "+" : ""}${v.toFixed(1)}%`;
}

// SVG 座標常數
const VW = 880;
const VH = 360;
const PAD = { top: 28, right: 24, bottom: 44, left: 50 };
const PLOT_W = VW - PAD.left - PAD.right;
const PLOT_H = VH - PAD.top - PAD.bottom;

type SeriesPoint = { idx: number; value: number };

export function PnlChart() {
  const [race, setRace] = useState<RaceType>("main");
  const [hovered, setHovered] = useState<string | null>(null);
  const [pinned, setPinned] = useState<string | null>(null);
  const active = hovered ?? pinned;

  // 各車隊沿賽季的累積盈虧序列
  const series = useMemo(() => {
    return TEAMS.map((team, i) => {
      let cum = 0;
      const points: SeriesPoint[] = [];
      CHART_ROUNDS.forEach((r, idx) => {
        const entry = getRoundEntry(team.id, r.id);
        const v = entry ? (race === "main" ? mainScore(entry) : sprintScore(entry)) : undefined;
        if (typeof v === "number") {
          cum += v;
          points.push({ idx, value: cum });
        }
      });
      return { team, badge: `#${i + 1}`, points };
    });
  }, [race]);

  const allValues = series.flatMap((s) => s.points.map((p) => p.value));
  const hasData = allValues.length > 0;

  const rawMin = Math.min(0, ...allValues);
  const rawMax = Math.max(0, ...allValues);
  const span = rawMax - rawMin || 10;
  const yMin = rawMin - span * 0.12;
  const yMax = rawMax + span * 0.12;

  const R = CHART_ROUNDS.length;
  const xFor = (idx: number) => PAD.left + (R === 1 ? PLOT_W / 2 : (idx / (R - 1)) * PLOT_W);
  const yFor = (v: number) => PAD.top + PLOT_H - ((v - yMin) / (yMax - yMin)) * PLOT_H;

  const ticks = useMemo(() => {
    const count = 4;
    return Array.from({ length: count + 1 }, (_, k) => yMin + ((yMax - yMin) * k) / count);
  }, [yMin, yMax]);

  return (
    <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-4 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-xs font-semibold text-zinc-300">賽季累積盈虧</span>

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

      <p className="mt-3 text-xs text-zinc-500">
        賽季累積{race === "main" ? "主賽盈虧率" : "副賽股價表現"}　·　沿賽季站次的各車隊走勢（滑過圖例可高亮單一車隊）
      </p>

      {!hasData ? (
        <div className="mt-4 flex h-48 items-center justify-center rounded-xl border border-dashed border-white/15 text-sm text-zinc-500">
          尚無資料，賽季開跑後各車隊將逐站更新。
        </div>
      ) : (
        <div className="mt-4 w-full overflow-x-auto">
          <svg
            viewBox={`0 0 ${VW} ${VH}`}
            className="h-auto w-full min-w-[640px]"
            role="img"
            aria-label="各車隊賽季盈虧走勢折線圖"
          >
            {/* y 軸格線與標籤 */}
            {ticks.map((t, i) => {
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

            {/* x 軸：站次標籤 */}
            {CHART_ROUNDS.map((r, idx) => (
              <text
                key={r.id}
                x={xFor(idx)}
                y={VH - PAD.bottom + 22}
                textAnchor="middle"
                fontSize="11"
                fill="#d4d4d8"
              >
                {r.code}
              </text>
            ))}

            {/* 各車隊線 */}
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
                  {s.points.map((p) => (
                    <g key={p.idx}>
                      <circle
                        cx={xFor(p.idx)}
                        cy={yFor(p.value)}
                        r={isActive ? 5.5 : 4}
                        fill={s.team.color}
                        stroke="#0b0b0e"
                        strokeWidth="1.5"
                      />
                      {isActive ? (
                        <text
                          x={xFor(p.idx)}
                          y={yFor(p.value) - 11}
                          textAnchor="middle"
                          fontSize="11"
                          fontWeight="700"
                          fill={p.value >= 0 ? "#34d399" : "#fb7185"}
                        >
                          {formatPct(p.value)}
                        </text>
                      ) : null}
                    </g>
                  ))}
                </g>
              );
            })}
          </svg>
        </div>
      )}

      {/* 圖例（可點選釘選 / 滑過高亮） */}
      <div className="mt-4 flex flex-wrap gap-x-3 gap-y-2 border-t border-white/10 pt-3">
        {series.map((s) => {
          const isActive = active === s.team.id;
          const isPinned = pinned === s.team.id;
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
              <span className="max-w-[8rem] truncate">{s.team.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
