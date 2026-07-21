import { randomBytes } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { normalizeEmail } from "@/lib/whitelist-log";

export type AuthTokenRecord = {
  token: string;
  email: string;
  exp: number;
  used: boolean;
  createdAt: string;
};

const TOKEN_TTL_MS = 15 * 60 * 1000;

export function getAuthTokensFilePath() {
  return (
    process.env.AUTH_TOKENS_FILE ||
    "/var/www/good-together/data/auth-tokens.jsonl"
  );
}

async function readAllRecords(): Promise<AuthTokenRecord[]> {
  const filePath = getAuthTokensFilePath();
  try {
    const content = await readFile(filePath, "utf8");
    return content
      .split("\n")
      .filter(Boolean)
      .map((line) => JSON.parse(line) as AuthTokenRecord);
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw e;
  }
}

async function writeAllRecords(records: AuthTokenRecord[]) {
  const filePath = getAuthTokensFilePath();
  await mkdir(dirname(filePath), { recursive: true });
  const content =
    records.map((record) => JSON.stringify(record)).join("\n") +
    (records.length ? "\n" : "");
  await writeFile(filePath, content, "utf8");
}

function pruneExpired(records: AuthTokenRecord[], now = Date.now()) {
  // Keep recently used tokens briefly for audit; drop expired unused + old used.
  const keepUsedUntil = now - 24 * 60 * 60 * 1000;
  return records.filter((r) => {
    if (r.used) return r.exp > keepUsedUntil;
    return r.exp > now;
  });
}

export async function createLoginToken(email: string): Promise<string> {
  const normalized = normalizeEmail(email);
  const now = Date.now();
  const token = randomBytes(32).toString("base64url");
  const records = pruneExpired(await readAllRecords(), now);

  records.push({
    token,
    email: normalized,
    exp: now + TOKEN_TTL_MS,
    used: false,
    createdAt: new Date(now).toISOString(),
  });
  await writeAllRecords(records);
  return token;
}

export async function consumeLoginToken(
  token: string
): Promise<{ ok: true; email: string } | { ok: false; error: string }> {
  if (!token || typeof token !== "string") {
    return { ok: false, error: "INVALID" };
  }

  const now = Date.now();
  const records = await readAllRecords();
  const idx = records.findIndex((r) => r.token === token);
  if (idx < 0) return { ok: false, error: "INVALID" };

  const record = records[idx];
  if (record.used) return { ok: false, error: "USED" };
  if (record.exp <= now) return { ok: false, error: "EXPIRED" };

  records[idx] = { ...record, used: true };
  await writeAllRecords(pruneExpired(records, now));
  return { ok: true, email: record.email };
}
