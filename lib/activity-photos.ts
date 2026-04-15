import { readdir } from "node:fs/promises";
import path from "node:path";
import { ACTIVITY_EVENTS, ACTIVITY_PHOTO_COUNT } from "@/lib/activities";

const PUBLIC_DIR = path.join(process.cwd(), "public");
const ACTIVITIES_DIR = path.join(PUBLIC_DIR, "activities");
const INDEXED_FILE_REGEX = /^0?([1-4])\.(jpg|jpeg|png|webp|heic|heif|avif)$/i;

export type ActivityPhotoSlot = {
  index: number;
  src: string | null;
};

async function resolveFolderPhotoSlots(folder: string): Promise<ActivityPhotoSlot[]> {
  const slots: ActivityPhotoSlot[] = Array.from({ length: ACTIVITY_PHOTO_COUNT }).map((_, i) => ({
    index: i + 1,
    src: null,
  }));

  let files: string[] = [];
  try {
    files = await readdir(path.join(ACTIVITIES_DIR, folder));
  } catch {
    return slots;
  }

  for (const file of files) {
    const match = file.match(INDEXED_FILE_REGEX);
    if (!match) continue;

    const index = Number(match[1]);
    if (!index || index > ACTIVITY_PHOTO_COUNT) continue;

    const slot = slots[index - 1];
    if (slot.src) continue;
    slot.src = `/activities/${folder}/${encodeURIComponent(file)}`;
  }

  return slots;
}

export async function getActivityPhotoMap() {
  const entries = await Promise.all(
    ACTIVITY_EVENTS.map(async (activity) => {
      const slots = await resolveFolderPhotoSlots(activity.folder);
      return [activity.folder, slots] as const;
    }),
  );
  return Object.fromEntries(entries);
}

export async function getMarqueeItems() {
  const entries = await Promise.all(
    ACTIVITY_EVENTS.map(async (activity) => {
      const slots = await resolveFolderPhotoSlots(activity.folder);
      return slots.map((slot) => ({
        id: `${activity.folder}-${slot.index}`,
        title: activity.title,
        label: `照片 ${slot.index}`,
        src: slot.src,
      }));
    }),
  );
  return entries.flat();
}
