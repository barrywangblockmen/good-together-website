"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { TeamCard } from "@/components/aitgp/team-card";
import { ROUNDS, TEAMS, getRoundEntry, getTeamSeasonStats } from "@/lib/aitgp";

export function TeamsSection() {
  const [activeId, setActiveId] = useState(ROUNDS[1]?.id ?? ROUNDS[0].id);
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

          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {TEAMS.map((team, i) => (
              <TeamCard
                key={team.id}
                team={team}
                stats={getTeamSeasonStats(team.id)}
                badge={`#${i + 1}`}
                roundId={activeId}
              />
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
