import Image from "next/image";
import type { TeamSeasonStats } from "@/lib/aitgp";
import { PlaceholderLogo } from "@/components/aitgp/placeholder-art";

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

export function SeasonLeaderboard({ standings }: { standings: TeamSeasonStats[] }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/60">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 text-[11px] uppercase tracking-wider text-zinc-400">
              <th className="px-4 py-3 font-medium">名次</th>
              <th className="px-4 py-3 font-medium">車隊</th>
              <th className="px-4 py-3 font-medium">車手</th>
              <th className="px-4 py-3 text-right font-medium">累計積分</th>
              <th className="px-4 py-3 text-right font-medium">累計盈虧（主賽）</th>
              <th className="px-4 py-3 text-right font-medium">累計漲跌（副賽）</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((s, i) => {
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
