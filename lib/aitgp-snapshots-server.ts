import { promises as fs } from "fs";
import path from "path";
import type { HourlyRoundSnapshot, SnapshotStore, TeamRoundSnapshot } from "@/lib/aitgp-chart";
import { toHourKeyTaipei } from "@/lib/aitgp-chart";
import { ROUNDS, TEAMS, mainScore, sprintScore } from "@/lib/aitgp";
import {
  getEffectiveRoundStatus,
  getResolvedEntriesForRound,
  readSettlements,
} from "@/lib/aitgp-settlements-server";

const DATA_DIR = process.env.AITGP_DATA_DIR ?? path.join(process.cwd(), "data");
const SNAPSHOT_FILE = path.join(DATA_DIR, "aitgp-hourly.json");
const LATEST_FILE = path.join(DATA_DIR, "aitgp-latest.json");
const MANUAL_FILE = path.join(DATA_DIR, "aitgp-manual.json");

export type AitgpLatestPrices = {
  prices: Record<string, number>;
  updatedAt: string;
  unsupported: string[];
};

export type AitgpManualPrices = {
  prices: Record<string, number>;
  updatedAt?: string;
  note?: string;
};

export async function getActiveSnapshotRoundIds(): Promise<string[]> {
  const store = await readSettlements();
  return ROUNDS.filter((r) => getEffectiveRoundStatus(r.id, store) === "racing").map(
    (r) => r.id,
  );
}

export async function readSnapshots(): Promise<SnapshotStore> {
  try {
    const raw = await fs.readFile(SNAPSHOT_FILE, "utf8");
    return JSON.parse(raw) as SnapshotStore;
  } catch {
    return {};
  }
}

export async function readLatestPrices(): Promise<AitgpLatestPrices | null> {
  try {
    const raw = await fs.readFile(LATEST_FILE, "utf8");
    return JSON.parse(raw) as AitgpLatestPrices;
  } catch {
    return null;
  }
}

export async function writeLatestPrices(latest: AitgpLatestPrices): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(LATEST_FILE, JSON.stringify(latest, null, 2), "utf8");
}

/** 手動覆寫行情（期貨／選擇權等無法自動報價時使用） */
export async function readManualPrices(): Promise<Record<string, number>> {
  try {
    const raw = await fs.readFile(MANUAL_FILE, "utf8");
    const data = JSON.parse(raw) as AitgpManualPrices;
    return data.prices ?? {};
  } catch {
    return {};
  }
}

async function writeSnapshots(store: SnapshotStore): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(SNAPSHOT_FILE, JSON.stringify(store, null, 2), "utf8");
}

async function computeTeamSnapshots(
  roundId: string,
  prices: Record<string, number>,
): Promise<Record<string, TeamRoundSnapshot>> {
  const settlements = await readSettlements();
  const entries = getResolvedEntriesForRound(roundId, settlements);
  const byTeam = new Map(entries.map((e) => [e.teamId, e]));
  const teams: Record<string, TeamRoundSnapshot> = {};
  for (const team of TEAMS) {
    const entry = byTeam.get(team.id);
    if (!entry) continue;
    teams[team.id] = {
      main: mainScore(entry, prices),
      sprint: sprintScore(entry, prices),
    };
  }
  return teams;
}

/** 每小時最多寫入一筆；在取得即時行情後呼叫（僅伺服器） */
export async function appendHourlySnapshots(prices: Record<string, number>): Promise<SnapshotStore> {
  const activeRoundIds = await getActiveSnapshotRoundIds();
  if (activeRoundIds.length === 0) return readSnapshots();

  const now = new Date();
  const hourKey = toHourKeyTaipei(now);
  const store = await readSnapshots();
  let changed = false;

  for (const roundId of activeRoundIds) {
    const list = store[roundId] ?? [];
    const teams = await computeTeamSnapshots(roundId, prices);
    if (Object.keys(teams).length === 0) continue;

    const snap: HourlyRoundSnapshot = {
      at: now.toISOString(),
      hourKey,
      teams,
    };

    const existingIdx = list.findIndex((s) => s.hourKey === hourKey);
    if (existingIdx >= 0) {
      list[existingIdx] = snap;
    } else {
      list.push(snap);
    }
    store[roundId] = list;
    changed = true;
  }

  if (changed) await writeSnapshots(store);
  return store;
}
