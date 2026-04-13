import { appendFile, mkdir } from "node:fs/promises";
import { dirname } from "node:path";

export type SubmissionRecord = {
  createdAt: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
  consent: true;
  ip: string;
  userAgent: string;
  referrer: string;
};

export function getSubmissionsFilePath() {
  return (
    process.env.SUBMISSIONS_FILE || "/var/www/good-together/data/submissions.jsonl"
  );
}

export async function appendSubmission(record: SubmissionRecord) {
  const filePath = getSubmissionsFilePath();
  await mkdir(dirname(filePath), { recursive: true });
  await appendFile(filePath, `${JSON.stringify(record)}\n`, "utf8");
}

