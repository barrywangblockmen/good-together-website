import { promises as fs } from "fs";
import path from "path";
import {
  ROUND_ENTRIES,
  ROUNDS,
  applySettledExits,
  formatSettlePrice,
  getEntriesForRound,
  isTwStockSymbol,
  type RoundEntry,
  type RoundStatus,
} from "@/lib/aitgp";

const DATA_DIR = process.env.AITGP_DATA_DIR ?? path.join(process.cwd(), "data");
const SETTLEMENTS_FILE = path.join(DATA_DIR, "aitgp-settlements.json");

export type RoundSettlement = {
  /** 覆蓋 ROUNDS.status（例如全部標的結算後改 settled） */
  status?: RoundStatus;
  /** symbol → 結算價字串 */
  exits: Record<string, string>;
  settledAt?: string;
  note?: string;
};

export type SettlementsStore = Record<string, RoundSettlement>;

export async function readSettlements(): Promise<SettlementsStore> {
  try {
    const raw = await fs.readFile(SETTLEMENTS_FILE, "utf8");
    return JSON.parse(raw) as SettlementsStore;
  } catch {
    return {};
  }
}

async function writeSettlements(store: SettlementsStore): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(SETTLEMENTS_FILE, JSON.stringify(store, null, 2), "utf8");
}

/** 各站已鎖定的 exitPrice（供行情 API 回傳給前端） */
export async function getSettledExitsByRound(): Promise<Record<string, Record<string, string>>> {
  const store = await readSettlements();
  const out: Record<string, Record<string, string>> = {};
  for (const [roundId, settlement] of Object.entries(store)) {
    if (settlement.exits && Object.keys(settlement.exits).length > 0) {
      out[roundId] = settlement.exits;
    }
  }
  return out;
}

export function getEffectiveRoundStatus(
  roundId: string,
  store: SettlementsStore,
): RoundStatus | undefined {
  return store[roundId]?.status ?? ROUNDS.find((r) => r.id === roundId)?.status;
}

export function resolveRoundEntry(
  entry: RoundEntry,
  store: SettlementsStore,
): RoundEntry {
  return applySettledExits(entry, store[entry.roundId]?.exits);
}

/** 尚未鎖定的非台股標的（加密／美股代幣等） */
export function listOpenNonTwSymbols(roundId: string, store: SettlementsStore): string[] {
  const exits = store[roundId]?.exits ?? {};
  const symbols = new Set<string>();
  for (const entry of getEntriesForRound(roundId)) {
    for (const leg of [...entry.main, ...entry.sprint]) {
      if (isTwStockSymbol(leg.symbol)) continue;
      if (leg.exitPrice != null && leg.exitPrice !== "") continue;
      if (exits[leg.symbol] != null && exits[leg.symbol] !== "") continue;
      symbols.add(leg.symbol);
    }
  }
  return [...symbols];
}

function roundFullySettled(roundId: string, store: SettlementsStore): boolean {
  const exits = store[roundId]?.exits ?? {};
  for (const entry of getEntriesForRound(roundId)) {
    for (const leg of [...entry.main, ...entry.sprint]) {
      if (leg.exitPrice != null && leg.exitPrice !== "") continue;
      if (exits[leg.symbol] != null && exits[leg.symbol] !== "") continue;
      return false;
    }
  }
  return getEntriesForRound(roundId).length > 0;
}

/**
 * 以目前行情鎖定指定站次所有尚未平倉的非台股標的。
 * 若全部標的皆已鎖定，將該站 status 覆寫為 settled。
 */
export async function settleOpenNonTwLegs(
  roundId: string,
  prices: Record<string, number>,
  note?: string,
): Promise<{
  roundId: string;
  locked: Record<string, string>;
  missing: string[];
  status?: RoundStatus;
  store: SettlementsStore;
}> {
  const store = await readSettlements();
  const open = listOpenNonTwSymbols(roundId, store);
  const locked: Record<string, string> = {};
  const missing: string[] = [];

  const prev = store[roundId] ?? { exits: {} };
  const exits = { ...prev.exits };

  for (const symbol of open) {
    const price = prices[symbol];
    if (price == null || !Number.isFinite(price)) {
      missing.push(symbol);
      continue;
    }
    const formatted = formatSettlePrice(price);
    exits[symbol] = formatted;
    locked[symbol] = formatted;
  }

  const next: RoundSettlement = {
    ...prev,
    exits,
    settledAt: new Date().toISOString(),
    note: note ?? prev.note ?? "非台股標的依排程結算鎖定",
  };

  const provisional = { ...store, [roundId]: next };
  if (roundFullySettled(roundId, provisional)) {
    next.status = "settled";
  }

  store[roundId] = next;
  await writeSettlements(store);

  return {
    roundId,
    locked,
    missing,
    status: next.status,
    store,
  };
}

/** 找出需自動結算非台股的站次（racing，且尚未全部鎖定） */
export function listRoundsNeedingNonTwSettle(store: SettlementsStore): string[] {
  return ROUNDS.filter((r) => {
    const status = getEffectiveRoundStatus(r.id, store);
    if (status !== "racing") return false;
    return listOpenNonTwSymbols(r.id, store).length > 0;
  }).map((r) => r.id);
}

/** 供快照計算：套用結算後的 ROUND_ENTRIES 視圖 */
export function getResolvedEntriesForRound(
  roundId: string,
  store: SettlementsStore,
): RoundEntry[] {
  return ROUND_ENTRIES.filter((e) => e.roundId === roundId).map((e) =>
    resolveRoundEntry(e, store),
  );
}
