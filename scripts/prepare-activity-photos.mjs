import { mkdir, readdir, rename, rm } from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";

const rootDir = process.cwd();
const activitiesDir = path.join(rootDir, "public", "activities");
const tempDir = path.join(activitiesDir, ".tmp-optimized");
const supportedExtRegex = /\.(jpe?g|png|webp|heic|heif|avif)$/i;

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: "inherit" });
    child.on("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${command} exited with code ${code ?? "unknown"}`));
    });
    child.on("error", reject);
  });
}

function isIndexedJpg(file) {
  return /^0[1-4]\.jpg$/i.test(file);
}

function getIndexedSlot(file) {
  const match = file.match(/^0([1-4])\.jpg$/i);
  return match ? Number(match[1]) : null;
}

async function optimizeOne(inputPath, outputPath) {
  await run("sips", [
    "-s",
    "format",
    "jpeg",
    "-s",
    "formatOptions",
    "75",
    "--resampleHeightWidthMax",
    "1800",
    inputPath,
    "--out",
    outputPath,
  ]);
}

async function processFolder(folderName, cleanup) {
  const folderPath = path.join(activitiesDir, folderName);
  const names = await readdir(folderPath);
  const occupiedSlots = new Set(
    names
      .map((name) => getIndexedSlot(name))
      .filter((slot) => typeof slot === "number"),
  );
  const emptySlots = [1, 2, 3, 4].filter((slot) => !occupiedSlots.has(slot));
  const imageFiles = names.filter((name) => supportedExtRegex.test(name) && !isIndexedJpg(name)).sort();

  if (imageFiles.length === 0 || emptySlots.length === 0) return { folderName, processed: 0 };

  let processed = 0;
  const processedSourcePaths = [];
  for (const [idx, file] of imageFiles.slice(0, emptySlots.length).entries()) {
    const targetName = `0${emptySlots[idx]}.jpg`;
    const targetPath = path.join(folderPath, targetName);
    const tmpOutput = path.join(tempDir, `${folderName}-${targetName}`);
    await optimizeOne(path.join(folderPath, file), tmpOutput);
    await rm(targetPath, { force: true });
    await rename(tmpOutput, targetPath);
    processed += 1;
    processedSourcePaths.push(path.join(folderPath, file));
  }

  if (cleanup) {
    for (const sourcePath of processedSourcePaths) {
      await rm(sourcePath, { force: true });
    }
  }

  return { folderName, processed };
}

async function main() {
  const cleanup = process.argv.includes("--cleanup");
  await mkdir(tempDir, { recursive: true });

  const entries = await readdir(activitiesDir, { withFileTypes: true });
  const folders = entries
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith("."))
    .map((entry) => entry.name)
    .sort();

  const results = [];
  for (const folder of folders) {
    const result = await processFolder(folder, cleanup);
    results.push(result);
  }

  await rm(tempDir, { recursive: true, force: true });

  console.log("\nPhoto preparation finished:");
  for (const item of results) {
    console.log(`- ${item.folderName}: ${item.processed} file(s) -> 01~04.jpg`);
  }
  if (cleanup) {
    console.log("- cleanup: original source files removed after conversion");
  }
}

await main();
