#!/usr/bin/env node

import { cp, mkdir, rm } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const standaloneDir = path.join(root, ".next", "standalone");
const staticSrc = path.join(root, ".next", "static");
const staticDest = path.join(standaloneDir, ".next", "static");
const publicSrc = path.join(root, "public");
const publicDest = path.join(standaloneDir, "public");

try {
  await mkdir(path.join(standaloneDir, ".next"), { recursive: true });
  await rm(staticDest, { recursive: true, force: true });
  await rm(publicDest, { recursive: true, force: true });
  await cp(staticSrc, staticDest, { recursive: true });
  await cp(publicSrc, publicDest, { recursive: true });
  console.log("Synced .next/static and public into .next/standalone");
} catch (err) {
  const code = err && typeof err === "object" && "code" in err ? err.code : "";
  if (code === "ENOENT") {
    console.log("Standalone output not found; skipped asset sync");
    process.exit(0);
  }
  throw err;
}
