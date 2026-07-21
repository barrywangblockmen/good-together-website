"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import type { TeamSeasonStats } from "@/lib/aitgp";
import { PlaceholderLogo } from "@/components/aitgp/placeholder-art";

type SortKey = "points" | "main" | "sprint";
type SortDir = "asc" | "desc";

function formatPct(v?: number) {
  if (typeof v !== "number") return "—";
  return `${v > 0 ? "+" : ""}${v.toFixed(1)}%`;
}

function pnlClass(v?: number) {
  if (typeof v !== "number") return "text-zinc-500";
  if (v > 0) return "text-emerald-400";
  if (v < 0) return "text-rose-400";
  return "text-zinc-300";
}

function compareNullableNum(a?: number, b?: number, dir: SortDir = "desc"): number {
  const av = typeof a === "number" ? a : dir === "desc" ? -Infinity : Infinity;
  const bv = typeof b === "number" ? b : dir === "desc" ? -Infinity : Infinity;
  return dir === "desc" ? bv - av : av - bv;
}

function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  if (!active) {
    return (
      <svg viewBox="0 0 16 16" className="size-3 opacity-40" aria-hidden>
        <path
          d="M4 6h8M4 10h8"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 16 16" className="size-3 text-amber-300" aria-hidden>
      {dir === "desc" ? (
        <path d="M4 6h8l-4 5z" fill="currentColor" />
      ) : (
        <path d="M4 11h8l-4-5z" fill="currentColor" />
      )}
    </svg>
  );
}

function SortableHeader({
  label,
  sortKey,
  activeKey,
  dir,
  onSort,
  align = "left",
}: {
  label: string;
  sortKey: SortKey;
  activeKey: SortKey;
  dir: SortDir;
  onSort: (key: SortKey) => void;
  align?: "left" | "right";
}) {
  const active = activeKey === sortKey;
  return (
    <th className={`px-4 py-3 font-medium ${align === "right" ? "text-right" : "text-left"}`}>
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        className={`inline-flex items-center gap-1.5 transition hover:text-white ${
          active ? "text-amber-200" : "text-zinc-400"
        } ${align === "right" ? "ml-auto" : ""}`}
        aria-sort={active ? (dir === "asc" ? "ascending" : "descending") : "none"}
      >
        <span>{label}</span>
        <SortIcon active={active} dir={dir} />
      </button>
    </th>
  );
}

export function SeasonLeaderboard({ standings }: { standings: TeamSeasonStats[] }) {
  const [sortKey, setSortKey] = useState<SortKey>("points");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const sorted = useMemo(() => {
    const rows = [...standings];
    rows.sort((a, b) => {
      let cmp = 0;
      if (sortKey === "points") cmp = compareNullableNum(a.points, b.points, sortDir);
      else if (sortKey === "main")
        cmp = compareNullableNum(a.cumulativeMainReturnPct, b.cumulativeMainReturnPct, sortDir);
      else cmp = compareNullableNum(a.cumulativeSprintReturnPct, b.cumulativeSprintReturnPct, sortDir);
      if (cmp !== 0) return cmp;
      return a.team.name.localeCompare(b.team.name, "zh-Hant");
    });
    return rows;
  }, [standings, sortKey, sortDir]);

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "desc" ? "asc" : "desc"));
      return;
    }
    setSortKey(key);
    setSortDir("desc");
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/60">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 text-[11px] uppercase tracking-wider">
              <th className="px-4 py-3 font-medium text-zinc-400">名次</th>
              <th className="px-4 py-3 font-medium text-zinc-400">車隊</th>
              <th className="px-4 py-3 font-medium text-zinc-400">車手</th>
              <SortableHeader
                label="累計積分"
                sortKey="points"
                activeKey={sortKey}
                dir={sortDir}
                onSort={handleSort}
                align="right"
              />
              <SortableHeader
                label="累計盈虧（主賽）"
                sortKey="main"
                activeKey={sortKey}
                dir={sortDir}
                onSort={handleSort}
                align="right"
              />
              <SortableHeader
                label="累計漲跌（副賽）"
                sortKey="sprint"
                activeKey={sortKey}
                dir={sortDir}
                onSort={handleSort}
                align="right"
              />
            </tr>
          </thead>
          <tbody>
            {sorted.map((s, i) => {
              const rank = i + 1;
              return (
                <tr
                  key={s.team.id}
                  className="border-b border-white/5 transition last:border-0 hover:bg-white/5"
                >
                  <td className="px-4 py-3">
                    <span
                      className="inline-flex size-7 items-center justify-center rounded-md text-xs font-bold text-white"
                      style={{
                        backgroundColor: rank <= 3 ? s.team.color : "transparent",
                        border: rank <= 3 ? "none" : "1px solid rgba(255,255,255,0.12)",
                        color: rank <= 3 ? "#fff" : "#a1a1aa",
                      }}
                    >
                      {rank}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative size-8 shrink-0 overflow-hidden rounded-full border border-white/15 bg-black/50">
                        {s.team.logo ? (
                          <Image
                            src={s.team.logo}
                            alt=""
                            fill
                            quality={75}
                            sizes="32px"
                            className="object-cover"
                          />
                        ) : (
                          <PlaceholderLogo
                            color={s.team.color}
                            badge={`${rank}`}
                            className="h-full w-full"
                          />
                        )}
                      </div>
                      <span className="font-medium text-white">{s.team.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-zinc-400">{s.team.driver}</td>
                  <td className="px-4 py-3 text-right font-bold text-white">{s.points}</td>
                  <td
                    className={`px-4 py-3 text-right font-semibold ${pnlClass(s.cumulativeMainReturnPct)}`}
                  >
                    {formatPct(s.cumulativeMainReturnPct)}
                  </td>
                  <td
                    className={`px-4 py-3 text-right font-semibold ${pnlClass(s.cumulativeSprintReturnPct)}`}
                  >
                    {formatPct(s.cumulativeSprintReturnPct)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
