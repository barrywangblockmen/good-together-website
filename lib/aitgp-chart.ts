import { ROUNDS, TEAMS, type Round } from "@/lib/aitgp";

export type TeamRoundSnapshot = {
  main?: number;
  sprint?: number;
};

export type HourlyRoundSnapshot = {
  at: string;
  hourKey: string;
  teams: Record<string, TeamRoundSnapshot>;
};

export type SnapshotStore = Record<string, HourlyRoundSnapshot[]>;

export type HourSlot = {
  idx: number;
  hourKey: string;
  label: string;
  dayLabel: string;
};

export const AITGP_PRICE_TTL_SECONDS = 3600;
export const SEASON_YEAR = 2026;
/** 圖表時間軸：週一至週五、每日 9:00–21:00（台灣時間，一小時一格） */
export const CHART_HOUR_START = 9;
export const CHART_HOUR_END = 21;

export type AitgpPriceSnapshot = {
  prices: Record<string, number>;
  updatedAt: string;
  unsupported: string[];
  chartHistory: SnapshotStore;
};

/** 圖表分頁用賽程（含暖身 GP0） */
export const CHART_TAB_ROUNDS = ROUNDS;

export function toHourKeyTaipei(date: Date): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Taipei",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    hour12: false,
  }).formatToParts(date);

  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "00";
  return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}`;
}

export function parseTradingPeriod(period: string): { start: Date; end: Date } {
  const m = period.match(/(\d{1,2})\/(\d{1,2}).*?–\s*(\d{1,2})\/(\d{1,2})/);
  if (!m) throw new Error(`無法解析賽期：${period}`);

  const startMonth = Number(m[1]);
  const startDay = Number(m[2]);
  const endMonth = Number(m[3]);
  const endDay = Number(m[4]);

  const pad = (n: number) => String(n).padStart(2, "0");
  const start = new Date(
    `${SEASON_YEAR}-${pad(startMonth)}-${pad(startDay)}T${pad(CHART_HOUR_START)}:00:00+08:00`,
  );
  const end = new Date(
    `${SEASON_YEAR}-${pad(endMonth)}-${pad(endDay)}T${pad(CHART_HOUR_END)}:00:00+08:00`,
  );
  return { start, end };
}

function taipeiWeekday(date: Date): number {
  const wd = new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Taipei", weekday: "short" })
    .format(date)
    .slice(0, 3);
  const map: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  return map[wd] ?? 0;
}

function addTaipeiDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
}

function formatDayLabel(date: Date): string {
  return new Intl.DateTimeFormat("zh-TW", {
    timeZone: "Asia/Taipei",
    month: "numeric",
    day: "numeric",
  }).format(date);
}

function formatHourLabel(date: Date): string {
  return new Intl.DateTimeFormat("zh-TW", {
    timeZone: "Asia/Taipei",
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

/** 依賽程 tradingPeriod 刻出固定小時格（僅週一～五 9:00–21:00） */
export function buildRoundHourGrid(round: Round): HourSlot[] {
  const { start, end } = parseTradingPeriod(round.tradingPeriod);
  const slots: HourSlot[] = [];
  let idx = 0;

  for (let cursor = new Date(start); cursor <= end; cursor = addTaipeiDays(cursor, 1)) {
    if (taipeiWeekday(cursor) === 0 || taipeiWeekday(cursor) === 6) continue;

    for (let hour = CHART_HOUR_START; hour <= CHART_HOUR_END; hour++) {
      const parts = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Taipei",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).formatToParts(cursor);
      const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "01";
      const at = new Date(
        `${get("year")}-${get("month")}-${get("day")}T${String(hour).padStart(2, "0")}:00:00+08:00`,
      );
      if (at < start || at > end) continue;

      slots.push({
        idx: idx++,
        hourKey: toHourKeyTaipei(at),
        label: formatHourLabel(at),
        dayLabel: formatDayLabel(at),
      });
    }
  }

  return slots;
}

export function buildRoundHourGridById(roundId: string): HourSlot[] {
  const round = ROUNDS.find((r) => r.id === roundId);
  return round ? buildRoundHourGrid(round) : [];
}

/** x 軸刻度：每日第一格 + 末格 */
export function pickAxisTicks(grid: HourSlot[]): { idx: number; label: string }[] {
  if (grid.length === 0) return [];

  const ticks: { idx: number; label: string }[] = [];
  let lastDay = "";

  for (const slot of grid) {
    if (slot.dayLabel !== lastDay) {
      ticks.push({ idx: slot.idx, label: slot.dayLabel });
      lastDay = slot.dayLabel;
    }
  }

  const last = grid[grid.length - 1];
  if (ticks[ticks.length - 1]?.idx !== last.idx) {
    ticks.push({ idx: last.idx, label: last.label });
  }

  return ticks;
}

/** 目前時間在格線上的索引（未開賽 -1、已結束 = 最後一格） */
export function currentGridIndex(grid: HourSlot[], now = new Date()): number {
  if (grid.length === 0) return -1;
  const key = toHourKeyTaipei(now);
  const idx = grid.findIndex((s) => s.hourKey >= key);
  if (idx === -1) {
    return key > grid[grid.length - 1].hourKey ? grid.length - 1 : -1;
  }
  return idx;
}

export function formatSnapshotLabel(iso: string): string {
  return formatHourLabel(new Date(iso));
}

/** 以台北時間對齊快照（相容舊版 UTC hourKey） */
export function buildSnapshotByHourKey(
  snapshots: HourlyRoundSnapshot[] | undefined,
): Map<string, HourlyRoundSnapshot> {
  const map = new Map<string, HourlyRoundSnapshot>();
  for (const snap of snapshots ?? []) {
    map.set(toHourKeyTaipei(new Date(snap.at)), snap);
  }
  return map;
}

/** 賽季站次（不含暖身）最後一筆快照的累計分數 */
export function settledRoundTotals(
  store: SnapshotStore,
  race: "main" | "sprint",
): Record<string, number> {
  const totals: Record<string, number> = {};
  const field = race === "main" ? "main" : "sprint";

  for (const round of ROUNDS) {
    if (round.id === "warmup" || round.status !== "settled") continue;
    const snaps = store[round.id];
    const last = snaps?.[snaps.length - 1];
    if (!last) continue;
    for (const team of TEAMS) {
      const v = last.teams[team.id]?.[field];
      if (typeof v === "number") {
        totals[team.id] = (totals[team.id] ?? 0) + v;
      }
    }
  }

  return totals;
}
