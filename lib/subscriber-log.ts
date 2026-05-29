import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import {
  isNewsletterTopicId,
  type NewsletterTopicId,
} from "@/lib/newsletter-topics";

export type TopicSubscription = {
  status: "active" | "unsubscribed";
  unsubscribeToken: string;
  subscribedAt: string;
  unsubscribedAt?: string;
};

export type SubscriberRecord = {
  email: string;
  name?: string;
  consent: true;
  createdAt: string;
  ip: string;
  userAgent: string;
  referrer: string;
  topics: Record<string, TopicSubscription>;
};

/** @deprecated Legacy single-list format; migrated on read. */
type LegacySubscriberRecord = {
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
  topics?: Record<string, TopicSubscription>;
};

export type SubscribeInput = {
  email: string;
  name?: string;
  topics: NewsletterTopicId[];
  consent: true;
  ip: string;
  userAgent: string;
  referrer: string;
};

export type ActiveSubscriberForTopic = {
  email: string;
  name?: string;
  unsubscribeToken: string;
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

function isLegacyRecord(raw: LegacySubscriberRecord): boolean {
  return (
    typeof raw.status === "string" &&
    typeof raw.unsubscribeToken === "string" &&
    !raw.topics
  );
}

function migrateLegacyRecord(raw: LegacySubscriberRecord): SubscriberRecord {
  const topicEntry: TopicSubscription = {
    status: raw.status,
    unsubscribeToken: raw.unsubscribeToken,
    subscribedAt: raw.createdAt,
    unsubscribedAt: raw.unsubscribedAt,
  };

  const topics: Record<string, TopicSubscription> = {};
  for (const id of ["btc-daily", "activity-monthly", "course-monthly"] as const) {
    topics[id] = { ...topicEntry };
  }

  return {
    email: raw.email,
    name: raw.name,
    consent: true,
    createdAt: raw.createdAt,
    ip: raw.ip,
    userAgent: raw.userAgent,
    referrer: raw.referrer,
    topics,
  };
}

function normalizeRecord(raw: LegacySubscriberRecord): SubscriberRecord {
  if (isLegacyRecord(raw)) {
    return migrateLegacyRecord(raw);
  }
  return raw as SubscriberRecord;
}

async function readAllRecords(): Promise<SubscriberRecord[]> {
  const filePath = getSubscribersFilePath();
  try {
    const content = await readFile(filePath, "utf8");
    return content
      .split("\n")
      .filter(Boolean)
      .map((line) => normalizeRecord(JSON.parse(line) as LegacySubscriberRecord));
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

function createTopicSubscription(now: string): TopicSubscription {
  return {
    status: "active",
    unsubscribeToken: randomUUID(),
    subscribedAt: now,
  };
}

export async function findByEmail(
  email: string
): Promise<SubscriberRecord | undefined> {
  const normalized = normalizeEmail(email);
  const map = indexByEmail(await readAllRecords());
  return map.get(normalized);
}

export async function listActiveSubscribersForTopic(
  topicId: NewsletterTopicId
): Promise<ActiveSubscriberForTopic[]> {
  const map = indexByEmail(await readAllRecords());
  const result: ActiveSubscriberForTopic[] = [];

  for (const record of map.values()) {
    const sub = record.topics[topicId];
    if (!sub || sub.status !== "active") continue;
    result.push({
      email: record.email,
      name: record.name,
      unsubscribeToken: sub.unsubscribeToken,
    });
  }

  return result;
}

export async function appendSubscriber(
  input: SubscribeInput
): Promise<{ already: boolean; addedTopics: NewsletterTopicId[] }> {
  const email = normalizeEmail(input.email);
  const map = indexByEmail(await readAllRecords());
  const existing = map.get(email);
  const now = new Date().toISOString();

  const topics: Record<string, TopicSubscription> = {
    ...(existing?.topics ?? {}),
  };

  const addedTopics: NewsletterTopicId[] = [];

  for (const topicId of input.topics) {
    const current = topics[topicId];
    if (current?.status === "active") continue;

    topics[topicId] = createTopicSubscription(now);
    addedTopics.push(topicId);
  }

  const already = addedTopics.length === 0;

  const record: SubscriberRecord = {
    email,
    name: input.name ?? existing?.name,
    consent: true,
    createdAt: existing?.createdAt ?? now,
    ip: input.ip,
    userAgent: input.userAgent,
    referrer: input.referrer,
    topics,
  };

  map.set(email, record);
  await writeAllRecords([...map.values()]);
  return { already, addedTopics };
}

export async function unsubscribeByToken(
  token: string
): Promise<{ ok: boolean; topicIds: NewsletterTopicId[] }> {
  const map = indexByEmail(await readAllRecords());
  let updated = false;
  const topicIds: NewsletterTopicId[] = [];

  for (const [email, record] of map) {
    const newTopics = { ...record.topics };
    let emailChanged = false;

    for (const [id, sub] of Object.entries(record.topics)) {
      if (sub.unsubscribeToken !== token) continue;
      if (!isNewsletterTopicId(id)) continue;

      if (sub.status === "active") {
        newTopics[id] = {
          ...sub,
          status: "unsubscribed",
          unsubscribedAt: new Date().toISOString(),
        };
        emailChanged = true;
      }
      if (!topicIds.includes(id)) topicIds.push(id);
    }

    if (emailChanged) {
      map.set(email, { ...record, topics: newTopics });
      updated = true;
    } else if (topicIds.length > 0) {
      return { ok: true, topicIds };
    }
  }

  if (!updated && topicIds.length === 0) return { ok: false, topicIds: [] };
  if (updated) await writeAllRecords([...map.values()]);
  return { ok: true, topicIds };
}
