import Image from "next/image";
import type { MainLeg, SprintLeg, Team, TeamSeasonStats } from "@/lib/aitgp";
import {
  getRoundEntry,
  mainLegReturnPct,
  mainScore,
  sprintLegReturnPct,
  sprintScore,
} from "@/lib/aitgp";
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

function formatLivePrice(n: number): string {
  if (n >= 1000) return n.toLocaleString("en-US", { maximumFractionDigits: 2 });
  if (n >= 1) return n.toFixed(2);
  if (n >= 0.0001) return n.toFixed(6).replace(/\.?0+$/, "");
  return n.toPrecision(4);
}

function LegPriceResult({
  entryPrice,
  resultLabel,
  resultPct,
  livePrice,
}: {
  entryPrice?: string;
  resultLabel: "盈虧" | "漲跌";
  resultPct?: number;
  livePrice?: number;
}) {
  return (
    <span className="flex shrink-0 flex-col items-end gap-0.5 text-xs sm:flex-row sm:items-center sm:gap-2">
      <span className="flex items-center gap-2">
        {entryPrice ? <span className="text-zinc-500">@ {entryPrice}</span> : null}
        {livePrice != null ? (
          <span className="text-zinc-600">現 {formatLivePrice(livePrice)}</span>
        ) : null}
      </span>
      <span className="flex items-center gap-2">
        <span className="text-zinc-500">{resultLabel}</span>
        <span className={`min-w-[3.5rem] text-right font-semibold ${pnlClass(resultPct)}`}>
          {formatPct(resultPct)}
        </span>
      </span>
    </span>
  );
}

function MainLegRow({ leg, livePrice }: { leg: MainLeg; livePrice?: number }) {
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
      <LegPriceResult
        entryPrice={leg.entryPrice}
        resultLabel="盈虧"
        resultPct={mainLegReturnPct(leg, livePrice)}
        livePrice={livePrice}
      />
    </li>
  );
}

function SprintLegRow({ leg, livePrice }: { leg: SprintLeg; livePrice?: number }) {
  return (
    <li className="flex items-center justify-between gap-2 py-1">
      <span className="flex min-w-0 items-center gap-2">
        <span className="inline-flex shrink-0 rounded bg-sky-500/15 px-1.5 py-0.5 text-[10px] font-bold text-sky-400">
          看漲
        </span>
        <span className="truncate text-zinc-200">
          {leg.label ? `${leg.label} ` : ""}
          <span className="text-zinc-400">{leg.symbol}</span>
        </span>
      </span>
      <LegPriceResult
        entryPrice={leg.entryPrice}
        resultLabel="漲跌"
        resultPct={sprintLegReturnPct(leg, livePrice)}
        livePrice={livePrice}
      />
    </li>
  );
}

function TeamLogo({ team, badge }: { team: Team; badge: string }) {
  return (
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
  );
}

function TeamCarImage({
  team,
  badge,
  className,
  sizes,
}: {
  team: Team;
  badge: string;
  className?: string;
  sizes: string;
}) {
  return (
    <div className={`relative bg-gradient-to-br from-black/60 to-zinc-800/40 ${className ?? ""}`}>
      {team.car ? (
        <Image
          src={team.car}
          alt={`${team.name} 賽車`}
          fill
          quality={75}
          sizes={sizes}
          className="object-cover transition duration-500 group-hover:scale-105"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center p-4">
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
  );
}

function RoundLegsPanel({
  entry,
  ms,
  ss,
  livePrices,
}: {
  entry: NonNullable<ReturnType<typeof getRoundEntry>>;
  ms?: number;
  ss?: number;
  livePrices?: Record<string, number>;
}) {
  return (
    <div className="grid grid-cols-1 gap-px bg-white/5 sm:grid-cols-2">
      <div className="bg-zinc-900/70 px-4 py-3">
        <div className="mb-1 flex items-center justify-between">
          <p className="text-[11px] font-medium uppercase tracking-wide text-rose-300">主賽 GP</p>
          <span className={`text-xs font-bold ${pnlClass(ms)}`}>
            {typeof ms === "number" ? formatPct(ms) : "進行中"}
          </span>
        </div>
        <ul className="text-xs">
          {entry.main.map((leg) => (
            <MainLegRow
              key={`${leg.symbol}-${leg.direction}`}
              leg={leg}
              livePrice={livePrices?.[leg.symbol]}
            />
          ))}
        </ul>
      </div>
      <div className="bg-zinc-900/70 px-4 py-3">
        <div className="mb-1 flex items-center justify-between">
          <p className="text-[11px] font-medium uppercase tracking-wide text-sky-300">副賽 Sprint</p>
          <span className={`text-xs font-bold ${pnlClass(ss)}`}>
            {typeof ss === "number" ? formatPct(ss) : "進行中"}
          </span>
        </div>
        <ul className="text-xs">
          {entry.sprint.map((leg) => (
            <SprintLegRow key={leg.symbol} leg={leg} livePrice={livePrices?.[leg.symbol]} />
          ))}
        </ul>
      </div>
    </div>
  );
}

export function TeamCard({
  team,
  stats,
  badge,
  roundId,
  variant = "card",
  livePrices,
}: {
  team: Team;
  stats: TeamSeasonStats;
  badge: string;
  roundId?: string;
  variant?: "card" | "list";
  livePrices?: Record<string, number>;
}) {
  const entry = roundId ? getRoundEntry(team.id, roundId) : undefined;
  const ms = entry ? mainScore(entry, livePrices) : undefined;
  const ss = entry ? sprintScore(entry, livePrices) : undefined;

  const blurb = team.blurb ? (
    <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-zinc-400">{team.blurb}</p>
  ) : !team.logo && !team.car ? (
    <p className="mt-2 text-xs italic text-zinc-500">Logo / 賽車待生成</p>
  ) : !team.logo ? (
    <p className="mt-2 text-xs italic text-zinc-500">Logo 待生成</p>
  ) : !team.car ? (
    <p className="mt-2 text-xs italic text-zinc-500">賽車待生成</p>
  ) : null;

  if (variant === "list") {
    return (
      <article
        className="group relative overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/70 shadow-lg"
        style={{ boxShadow: `inset 0 1px 0 0 ${team.color}33` }}
      >
        <span
          className="absolute inset-y-0 left-0 w-1"
          style={{ background: `linear-gradient(180deg, ${team.color}, transparent)` }}
          aria-hidden
        />
        <div className="flex flex-col md:flex-row">
          <TeamCarImage
            team={team}
            badge={badge}
            className="aspect-[16/9] w-full shrink-0 md:w-44 lg:w-52"
            sizes="(min-width: 768px) 208px, 100vw"
          />
          <div className="flex min-w-0 flex-1 flex-col">
            <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-start">
              <div className="flex min-w-0 flex-1 items-start gap-3">
                <TeamLogo team={team} badge={badge} />
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-base font-semibold text-white">{team.name}</h3>
                  <p className="text-xs text-zinc-400">車手 · {team.driver}</p>
                  {blurb}
                </div>
              </div>
              <div className="flex shrink-0 gap-4 text-center sm:gap-6">
                <div>
                  <p className="text-[10px] uppercase tracking-wide text-zinc-500">累計積分</p>
                  <p className="text-sm font-bold text-white">{stats.points}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wide text-zinc-500">累計盈虧</p>
                  <p className={`text-sm font-bold ${pnlClass(stats.cumulativeReturnPct)}`}>
                    {formatPct(stats.cumulativeReturnPct)}
                  </p>
                </div>
              </div>
            </div>
            {roundId ? (
              <div className="border-t border-white/10">
                {entry ? (
                  <RoundLegsPanel entry={entry} ms={ms} ss={ss} livePrices={livePrices} />
                ) : (
                  <div className="px-4 py-4 text-center text-xs text-zinc-500">尚未喊單 · 即將開始</div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </article>
    );
  }

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
      <TeamCarImage
        team={team}
        badge={badge}
        className="aspect-[16/9] w-full"
        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
      />

      <div className="flex items-start gap-3 p-5">
        <TeamLogo team={team} badge={badge} />
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-semibold text-white">{team.name}</h3>
          <p className="text-xs text-zinc-400">車手 · {team.driver}</p>
          {blurb}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-px border-t border-white/10 bg-white/5 text-center">
        <div className="bg-zinc-900/70 px-2 py-3">
          <p className="text-[10px] uppercase tracking-wide text-zinc-500">累計積分</p>
          <p className="text-sm font-bold text-white">{stats.points}</p>
        </div>
        <div className="bg-zinc-900/70 px-2 py-3">
          <p className="text-[10px] uppercase tracking-wide text-zinc-500">累計盈虧</p>
          <p className={`text-sm font-bold ${pnlClass(stats.cumulativeReturnPct)}`}>
            {formatPct(stats.cumulativeReturnPct)}
          </p>
        </div>
      </div>

      {roundId ? (
        <div className="border-t border-white/10">
          {entry ? (
            <RoundLegsPanel entry={entry} ms={ms} ss={ss} livePrices={livePrices} />
          ) : (
            <div className="px-4 py-4 text-center text-xs text-zinc-500">尚未喊單 · 即將開始</div>
          )}
        </div>
      ) : null}
    </article>
  );
}
