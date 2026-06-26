import Image from "next/image";
import type { MainLeg, SprintLeg, Team, TeamSeasonStats } from "@/lib/aitgp";
import { getRoundEntry, mainScore, sprintScore } from "@/lib/aitgp";
import { PlaceholderCar, PlaceholderLogo } from "@/components/aitgp/placeholder-art";

function formatPct(v?: number) {
  if (typeof v !== "number") return "—";
  return `${v > 0 ? "+" : ""}${v.toFixed(1)}%`;
}

function pnlClass(v?: number) {
  if (typeof v !== "number") return "text-zinc-400";
  if (v > 0) return "text-emerald-400";
  if (v < 0) return "text-rose-400";
  return "text-zinc-300";
}

function MainLegRow({ leg }: { leg: MainLeg }) {
  return (
    <li className="flex items-center justify-between gap-2 py-1">
      <span className="flex min-w-0 items-center gap-2">
        <span
          className={`inline-flex shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold ${
            leg.direction === "long"
              ? "bg-emerald-500/15 text-emerald-400"
              : "bg-rose-500/15 text-rose-400"
          }`}
        >
          {leg.direction === "long" ? "做多" : "做空"}
        </span>
        <span className="truncate text-zinc-200">
          {leg.label ? `${leg.label} ` : ""}
          <span className="text-zinc-400">{leg.symbol}</span>
        </span>
      </span>
      <span className={`shrink-0 text-xs font-semibold ${pnlClass(leg.returnPct)}`}>
        {formatPct(leg.returnPct)}
      </span>
    </li>
  );
}

function SprintLegRow({ leg }: { leg: SprintLeg }) {
  return (
    <li className="flex items-center justify-between gap-2 py-1">
      <span className="flex min-w-0 items-center gap-2">
        <span className="inline-flex shrink-0 rounded bg-sky-500/15 px-1.5 py-0.5 text-[10px] font-bold text-sky-400">
          HODL
        </span>
        <span className="truncate text-zinc-200">
          {leg.label ? `${leg.label} ` : ""}
          <span className="text-zinc-400">{leg.symbol}</span>
        </span>
      </span>
      <span className={`shrink-0 text-xs font-semibold ${pnlClass(leg.returnPct)}`}>
        {formatPct(leg.returnPct)}
      </span>
    </li>
  );
}

export function TeamCard({
  team,
  stats,
  badge,
  roundId,
}: {
  team: Team;
  stats: TeamSeasonStats;
  badge: string;
  roundId?: string;
}) {
  const entry = roundId ? getRoundEntry(team.id, roundId) : undefined;
  const ms = entry ? mainScore(entry) : undefined;
  const ss = entry ? sprintScore(entry) : undefined;

  return (
    <article
      className="group relative overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/70 shadow-lg"
      style={{ boxShadow: `inset 0 1px 0 0 ${team.color}33` }}
    >
      <span
        className="absolute inset-x-0 top-0 h-1"
        style={{ background: `linear-gradient(90deg, ${team.color}, transparent)` }}
        aria-hidden
      />
      <div className="relative aspect-[16/9] w-full bg-gradient-to-br from-black/60 to-zinc-800/40">
        {team.car ? (
          <Image
            src={team.car}
            alt={`${team.name} 賽車`}
            fill
            quality={75}
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center p-6">
            <PlaceholderCar color={team.color} className="h-full w-full opacity-90" />
          </div>
        )}
        <span
          className="absolute left-3 top-3 inline-flex h-7 min-w-7 items-center justify-center rounded-md px-2 text-xs font-bold text-white"
          style={{ backgroundColor: team.color }}
        >
          {badge}
        </span>
      </div>

      <div className="flex items-start gap-3 p-5">
        <div className="relative size-12 shrink-0 overflow-hidden rounded-full border border-white/15 bg-black/50">
          {team.logo ? (
            <Image
              src={team.logo}
              alt={`${team.name} Logo`}
              fill
              quality={75}
              sizes="48px"
              className="object-cover"
            />
          ) : (
            <PlaceholderLogo color={team.color} badge={badge} className="h-full w-full" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-semibold text-white">{team.name}</h3>
          <p className="text-xs text-zinc-400">車手 · {team.driver}</p>
          {team.blurb ? (
            <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-zinc-400">{team.blurb}</p>
          ) : !team.logo && !team.car ? (
            <p className="mt-2 text-xs italic text-zinc-500">Logo / 賽車待生成</p>
          ) : !team.logo ? (
            <p className="mt-2 text-xs italic text-zinc-500">Logo 待生成</p>
          ) : !team.car ? (
            <p className="mt-2 text-xs italic text-zinc-500">賽車待生成</p>
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-px border-t border-white/10 bg-white/5 text-center">
        <div className="bg-zinc-900/70 px-2 py-3">
          <p className="text-[10px] uppercase tracking-wide text-zinc-500">積分</p>
          <p className="text-sm font-bold text-white">{stats.points}</p>
        </div>
        <div className="bg-zinc-900/70 px-2 py-3">
          <p className="text-[10px] uppercase tracking-wide text-zinc-500">平均盈虧</p>
          <p className={`text-sm font-bold ${pnlClass(stats.avgReturnPct)}`}>
            {formatPct(stats.avgReturnPct)}
          </p>
        </div>
      </div>

      {roundId ? (
        <div className="border-t border-white/10">
          {entry ? (
            <div className="grid grid-cols-1 gap-px bg-white/5 sm:grid-cols-2">
              <div className="bg-zinc-900/70 px-4 py-3">
                <div className="mb-1 flex items-center justify-between">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-rose-300">
                    主賽 GP
                  </p>
                  <span className={`text-xs font-bold ${pnlClass(ms)}`}>{formatPct(ms)}</span>
                </div>
                <ul className="text-xs">
                  {entry.main.map((leg) => (
                    <MainLegRow key={`${leg.symbol}-${leg.direction}`} leg={leg} />
                  ))}
                </ul>
              </div>
              <div className="bg-zinc-900/70 px-4 py-3">
                <div className="mb-1 flex items-center justify-between">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-sky-300">
                    副賽 Sprint
                  </p>
                  <span className={`text-xs font-bold ${pnlClass(ss)}`}>{formatPct(ss)}</span>
                </div>
                <ul className="text-xs">
                  {entry.sprint.map((leg) => (
                    <SprintLegRow key={leg.symbol} leg={leg} />
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="px-4 py-4 text-center text-xs text-zinc-500">尚未喊單 · 即將開始</div>
          )}
        </div>
      ) : null}
    </article>
  );
}
