import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

export type SubscriberRecord = {
  email: string;
  name?: string;
  status: "active" | "unsubscribed";
  unsubscribeToken: string;
  consent: true;
  createdAt: string;
  unsubscribedAt?: string;
  ip: string;
  userAgent: string;
  referrer: string;
};

export type SubscribeInput = {
  email: string;
  name?: string;
  consent: true;
  ip: string;
  userAgent: string;
  referrer: string;
};

export function getSubscribersFilePath() {
  return (
    process.env.SUBSCRIBERS_FILE ||
    "/var/www/good-together/data/subscribers.jsonl"
  );
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

async function readAllRecords(): Promise<SubscriberRecord[]> {
  const filePath = getSubscribersFilePath();
  try {
    const content = await readFile(filePath, "utf8");
    return content
      .split("\n")
      .filter(Boolean)
      .map((line) => JSON.parse(line) as SubscriberRecord);
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw e;
  }
}

function indexByEmail(records: SubscriberRecord[]): Map<string, SubscriberRecord> {
  const map = new Map<string, SubscriberRecord>();
  for (const record of records) {
    map.set(record.email, record);
  }
  return map;
}

async function writeAllRecords(records: SubscriberRecord[]) {
  const filePath = getSubscribersFilePath();
  await mkdir(dirname(filePath), { recursive: true });
  const content =
    records.map((record) => JSON.stringify(record)).join("\n") +
    (records.length ? "\n" : "");
  await writeFile(filePath, content, "utf8");
}

export async function findByEmail(
  email: string
): Promise<SubscriberRecord | undefined> {
  const normalized = normalizeEmail(email);
  const map = indexByEmail(await readAllRecords());
  return map.get(normalized);
}

export async function listActiveSubscribers(): Promise<SubscriberRecord[]> {
  const map = indexByEmail(await readAllRecords());
  return [...map.values()].filter((record) => record.status === "active");
}

export async function appendSubscriber(
  input: SubscribeInput
): Promise<{ already: boolean }> {
  const email = normalizeEmail(input.email);
  const map = indexByEmail(await readAllRecords());
  const existing = map.get(email);

  if (existing?.status === "active") {
    return { already: true };
  }

  const now = new Date().toISOString();
  const record: SubscriberRecord = {
    email,
    name: input.name,
    status: "active",
    unsubscribeToken: randomUUID(),
    consent: true,
    createdAt: existing?.createdAt ?? now,
    ip: input.ip,
    userAgent: input.userAgent,
    referrer: input.referrer,
  };

  map.set(email, record);
  await writeAllRecords([...map.values()]);
  return { already: false };
}

export async function unsubscribeByToken(token: string): Promise<boolean> {
  const map = indexByEmail(await readAllRecords());
  let updated = false;

  for (const [email, record] of map) {
    if (record.unsubscribeToken !== token) continue;
    if (record.status === "unsubscribed") return true;

    map.set(email, {
      ...record,
      status: "unsubscribed",
      unsubscribedAt: new Date().toISOString(),
    });
    updated = true;
    break;
  }

  if (!updated) return false;
  await writeAllRecords([...map.values()]);
  return true;
}
