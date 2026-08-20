"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { TeamCard } from "@/components/aitgp/team-card";
import { useAitgpPrices } from "@/components/aitgp/use-aitgp-prices";
import { formatSnapshotLabel, AITGP_PRICE_UPDATE_NOTE } from "@/lib/aitgp-chart";
import { ROUNDS, TEAMS, applySettledExits, getDefaultRoundId, getRoundEntry, getTeamSeasonStats, mainScore, sprintScore } from "@/lib/aitgp";

type TeamLayout = "1" | "2" | "3" | "list";
type TeamSort = "main" | "sprint" | "points" | "name";

const LAYOUT_OPTIONS: { id: TeamLayout; label: string }[] = [
  { id: "1", label: "一列一張" },
  { id: "2", label: "一列兩張" },
  { id: "3", label: "一列三張" },
  { id: "list", label: "條列式" },
];

const SORT_OPTIONS: { id: TeamSort; label: string }[] = [
  { id: "main", label: "主賽盈虧" },
  { id: "sprint", label: "副賽漲跌" },
  { id: "points", label: "累計積分" },
  { id: "name", label: "車隊名稱" },
];

function SortIcon({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 16 16" className={`size-3.5 ${active ? "text-amber-300" : "opacity-50"}`} aria-hidden>
      <path
        d="M5 3.5h6M5 8h4M5 12.5h6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function LayoutIcon({ layout }: { layout: TeamLayout }) {
  const stroke = "currentColor";
  const common = { fill: "none", stroke, strokeWidth: 1.5, strokeLinecap: "round" as const };

  switch (layout) {
    case "1":
      return (
        <svg viewBox="0 0 20 20" className="size-4" aria-hidden>
          <rect x="4" y="4" width="12" height="12" rx="1.5" {...common} />
        </svg>
      );
    case "2":
      return (
        <svg viewBox="0 0 20 20" className="size-4" aria-hidden>
          <rect x="3" y="4" width="6.5" height="12" rx="1.5" {...common} />
          <rect x="10.5" y="4" width="6.5" height="12" rx="1.5" {...common} />
        </svg>
      );
    case "3":
      return (
        <svg viewBox="0 0 20 20" className="size-4" aria-hidden>
          <rect x="2.5" y="4" width="4" height="12" rx="1" {...common} />
          <rect x="8" y="4" width="4" height="12" rx="1" {...common} />
          <rect x="13.5" y="4" width="4" height="12" rx="1" {...common} />
        </svg>
      );
    case "list":
      return (
        <svg viewBox="0 0 20 20" className="size-4" aria-hidden>
          <rect x="3" y="4.5" width="5" height="4" rx="1" {...common} />
          <line x1="10" y1="6.5" x2="17" y2="6.5" {...common} />
          <rect x="3" y="11.5" width="5" height="4" rx="1" {...common} />
          <line x1="10" y1="13.5" x2="17" y2="13.5" {...common} />
        </svg>
      );
  }
}

function layoutGridClass(layout: TeamLayout) {
  switch (layout) {
    case "1":
      return "grid grid-cols-1 gap-5";
    case "2":
      return "grid grid-cols-1 gap-5 md:grid-cols-2";
    case "3":
      return "grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3";
    case "list":
      return "flex flex-col gap-3";
  }
}

export function TeamsSection() {
  const [activeId, setActiveId] = useState(ROUNDS[0]?.id ?? "warmup");
  const [layout, setLayout] = useState<TeamLayout>("list");
  const [sortBy, setSortBy] = useState<TeamSort>("main");
  const { snapshot, loading: pricesLoading, error: pricesError } = useAitgpPrices();
  const reduce = useReducedMotion();

  useEffect(() => {
    setActiveId(getDefaultRoundId());
  }, []);
  const round = ROUNDS.find((r) => r.id === activeId)!;
  const hasAnyData = TEAMS.some((t) => getRoundEntry(t.id, activeId));

  const rankedTeams = useMemo(() => {
    const roundExits = snapshot?.settledExits?.[activeId];
    const items = TEAMS.map((team) => {
      const raw = getRoundEntry(team.id, activeId);
      const entry = raw ? applySettledExits(raw, roundExits) : undefined;
      const main = entry ? mainScore(entry, snapshot?.prices) : undefined;
      const sprint = entry ? sprintScore(entry, snapshot?.prices) : undefined;
      const seasonPoints = getTeamSeasonStats(team.id, snapshot?.settledExits).points;
      return { team, main, sprint, seasonPoints };
    });

    const scoreFor = (item: (typeof items)[0]) => {
      if (sortBy === "main") return item.main;
      if (sortBy === "sprint") return item.sprint;
      if (sortBy === "points") return item.seasonPoints;
      return undefined;
    };

    const ranked = [...items]
      .filter((x) => sortBy === "name" || typeof scoreFor(x) === "number")
      .sort((a, b) => {
        if (sortBy === "name") return a.team.name.localeCompare(b.team.name, "zh-Hant");
        return scoreFor(b)! - scoreFor(a)!;
      });
    const unranked = items.filter((x) => sortBy !== "name" && typeof scoreFor(x) !== "number");

    return [
      ...ranked.map((x, i) => ({ ...x, badge: `#${i + 1}` })),
      ...unranked.map((x) => ({ ...x, badge: "—" })),
    ];
  }, [activeId, snapshot?.prices, snapshot?.settledExits, sortBy]);

  return (
    <div data-aitgp-section="teams" data-aitgp-round={activeId}>
      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-2">
        {ROUNDS.map((r) => {
          const active = r.id === activeId;
          return (
            <button
              key={r.id}
              type="button"
              onClick={() => setActiveId(r.id)}
              className={`shrink-0 rounded-full border px-3.5 py-2 text-xs font-semibold transition ${
                active
                  ? "border-rose-400 bg-gradient-to-r from-rose-500 to-amber-500 text-white"
                  : "border-white/10 bg-white/5 text-zinc-300 hover:border-white/30 hover:text-white"
              }`}
            >
              {r.code}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeId}
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? undefined : { opacity: 0, y: -8 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="mt-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-4 md:px-6 md:py-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-amber-300">
              {round.code} · {round.theme}
            </p>
            <h3 className="mt-1 text-lg font-semibold text-white md:text-xl">{round.name}</h3>
            <p className="mt-1 text-xs text-zinc-400">
              {round.circuit} · 賽期 {round.tradingPeriod} · {round.settleDate}
            </p>
            {round.note ? (
              <p className="mt-3 rounded-lg bg-amber-500/10 px-3 py-2 text-xs text-amber-200/90">
                {round.note}
              </p>
            ) : null}
            {!hasAnyData ? (
              <p className="mt-3 rounded-lg border border-dashed border-white/15 px-4 py-4 text-center text-sm text-zinc-500">
                本站尚未開始，各車隊將於賽期第一天喊單後更新標的與盈虧。
              </p>
            ) : null}
          </div>

          <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs text-zinc-500">排序方式</p>
              <div
                className="mt-1.5 inline-flex flex-wrap rounded-lg border border-white/10 bg-black/20 p-1"
                role="group"
                aria-label="車隊排序方式"
              >
                {SORT_OPTIONS.map((opt) => {
                  const active = sortBy === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setSortBy(opt.id)}
                      className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition ${
                        active
                          ? "bg-gradient-to-r from-rose-500/90 to-amber-500/90 text-white"
                          : "text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
                      }`}
                    >
                      <SortIcon active={active} />
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-zinc-500">顯示方式</p>
              {snapshot?.updatedAt ? (
                <p className="mt-0.5 text-[10px] text-zinc-600" suppressHydrationWarning>
                  行情更新 {formatSnapshotLabel(snapshot.updatedAt)}（{AITGP_PRICE_UPDATE_NOTE}）
                </p>
              ) : pricesLoading ? (
                <p className="mt-0.5 text-[10px] text-zinc-600">行情載入中…</p>
              ) : pricesError ? (
                <p className="mt-0.5 text-[10px] text-amber-600/80">行情暫不可用</p>
              ) : null}
              <div
                className="mt-1.5 inline-flex rounded-lg border border-white/10 bg-black/20 p-1"
                role="group"
                aria-label="車隊卡片顯示方式"
              >
                {LAYOUT_OPTIONS.map((opt) => {
                  const active = layout === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      title={opt.label}
                      aria-label={opt.label}
                      aria-pressed={active}
                      onClick={() => setLayout(opt.id)}
                      className={`rounded-md p-2 transition ${
                        active
                          ? "bg-white/10 text-white"
                          : "text-zinc-500 hover:bg-white/5 hover:text-zinc-200"
                      }`}
                    >
                      <LayoutIcon layout={opt.id} />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className={`mt-4 ${layoutGridClass(layout)}`}>
            {rankedTeams.map(({ team, badge }) => (
              <TeamCard
                key={team.id}
                team={team}
                stats={getTeamSeasonStats(team.id, snapshot?.settledExits)}
                badge={badge}
                roundId={activeId}
                variant={layout === "list" ? "list" : "card"}
                livePrices={snapshot?.prices}
                settledExits={snapshot?.settledExits?.[activeId]}
              />
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
