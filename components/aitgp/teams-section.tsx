"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { TeamCard } from "@/components/aitgp/team-card";
import { ROUNDS, TEAMS, getRoundEntry, getTeamSeasonStats } from "@/lib/aitgp";

type TeamLayout = "1" | "2" | "3" | "list";

const LAYOUT_OPTIONS: { id: TeamLayout; label: string }[] = [
  { id: "1", label: "一列一張" },
  { id: "2", label: "一列兩張" },
  { id: "3", label: "一列三張" },
  { id: "list", label: "條列式" },
];

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
  const [activeId, setActiveId] = useState(ROUNDS[0]?.id ?? "");
  const [layout, setLayout] = useState<TeamLayout>("list");
  const reduce = useReducedMotion();
  const round = ROUNDS.find((r) => r.id === activeId)!;
  const hasAnyData = TEAMS.some((t) => getRoundEntry(t.id, activeId));

  return (
    <div>
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

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-zinc-500">顯示方式</p>
            <div
              className="inline-flex rounded-lg border border-white/10 bg-black/20 p-1"
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

          <div className={`mt-4 ${layoutGridClass(layout)}`}>
            {TEAMS.map((team, i) => (
              <TeamCard
                key={team.id}
                team={team}
                stats={getTeamSeasonStats(team.id)}
                badge={`#${i + 1}`}
                roundId={activeId}
                variant={layout === "list" ? "list" : "card"}
              />
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
