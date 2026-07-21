import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import type { WhitelistRole } from "@/lib/schemas/auth";

export type WhitelistRecord = {
  email: string;
  role: WhitelistRole;
  createdAt: string;
  createdBy?: string;
};

export const BOOTSTRAP_ADMIN_EMAIL = "wahao888@gmail.com";

export function getWhitelistFilePath() {
  return (
    process.env.WHITELIST_FILE ||
    "/var/www/good-together/data/whitelist.jsonl"
  );
}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

async function readAllRecords(): Promise<WhitelistRecord[]> {
  const filePath = getWhitelistFilePath();
  try {
    const content = await readFile(filePath, "utf8");
    return content
      .split("\n")
      .filter(Boolean)
      .map((line) => JSON.parse(line) as WhitelistRecord)
      .filter(
        (r) =>
          typeof r.email === "string" &&
          (r.role === "member" || r.role === "admin")
      )
      .map((r) => ({
        email: normalizeEmail(r.email),
        role: r.role,
        createdAt: r.createdAt || new Date().toISOString(),
        createdBy: r.createdBy,
      }));
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw e;
  }
}

async function writeAllRecords(records: WhitelistRecord[]) {
  const filePath = getWhitelistFilePath();
  await mkdir(dirname(filePath), { recursive: true });
  const content =
    records.map((record) => JSON.stringify(record)).join("\n") +
    (records.length ? "\n" : "");
  await writeFile(filePath, content, "utf8");
}

/** Ensure bootstrap admin exists when the whitelist file is empty or missing. */
export async function ensureBootstrapAdmin(): Promise<void> {
  const records = await readAllRecords();
  if (records.length > 0) return;

  await writeAllRecords([
    {
      email: BOOTSTRAP_ADMIN_EMAIL,
      role: "admin",
      createdAt: new Date().toISOString(),
    },
  ]);
}

export async function listAll(): Promise<WhitelistRecord[]> {
  await ensureBootstrapAdmin();
  const records = await readAllRecords();
  return records.sort((a, b) => a.email.localeCompare(b.email));
}

export async function findByEmail(
  email: string
): Promise<WhitelistRecord | undefined> {
  await ensureBootstrapAdmin();
  const normalized = normalizeEmail(email);
  const records = await readAllRecords();
  return records.find((r) => r.email === normalized);
}

export async function isWhitelisted(email: string): Promise<boolean> {
  const record = await findByEmail(email);
  return Boolean(record);
}

export async function addEmail(input: {
  email: string;
  role: WhitelistRole;
  createdBy?: string;
}): Promise<{ ok: true; created: boolean } | { ok: false; error: string }> {
  await ensureBootstrapAdmin();
  const email = normalizeEmail(input.email);
  const records = await readAllRecords();
  if (records.some((r) => r.email === email)) {
    return { ok: false, error: "ALREADY_EXISTS" };
  }

  records.push({
    email,
    role: input.role,
    createdAt: new Date().toISOString(),
    createdBy: input.createdBy
      ? normalizeEmail(input.createdBy)
      : undefined,
  });
  await writeAllRecords(records);
  return { ok: true, created: true };
}

export async function removeEmail(
  email: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  await ensureBootstrapAdmin();
  const normalized = normalizeEmail(email);
  const records = await readAllRecords();
  const target = records.find((r) => r.email === normalized);
  if (!target) {
    return { ok: false, error: "NOT_FOUND" };
  }

  if (target.role === "admin") {
    const adminCount = records.filter((r) => r.role === "admin").length;
    if (adminCount <= 1) {
      return { ok: false, error: "LAST_ADMIN" };
    }
  }

  await writeAllRecords(records.filter((r) => r.email !== normalized));
  return { ok: true };
}

export async function updateRole(
  email: string,
  role: WhitelistRole
): Promise<{ ok: true } | { ok: false; error: string }> {
  await ensureBootstrapAdmin();
  const normalized = normalizeEmail(email);
  const records = await readAllRecords();
  const idx = records.findIndex((r) => r.email === normalized);
  if (idx < 0) return { ok: false, error: "NOT_FOUND" };

  const current = records[idx];
  if (current.role === "admin" && role === "member") {
    const adminCount = records.filter((r) => r.role === "admin").length;
    if (adminCount <= 1) {
      return { ok: false, error: "LAST_ADMIN" };
    }
  }

  records[idx] = { ...current, role };
  await writeAllRecords(records);
  return { ok: true };
}
