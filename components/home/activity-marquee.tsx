import Image from "next/image";
import { getMarqueeItems } from "@/lib/activity-photos";

export async function ActivityMarquee() {
  const photos = await getMarqueeItems();
  const items = [...photos, ...photos];
  return (
    <div className="activity-marquee-mask mt-10">
      <div className="activity-marquee-track">
        {items.map((photo, index) => (
          <article
            key={`${photo.id}-${index}`}
            className="w-48 shrink-0 rounded-2xl border border-edge bg-surface p-3 shadow-sm md:w-56"
          >
            {photo.src ? (
              <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-edge">
                <Image
                  src={photo.src}
                  alt={`${photo.title} ${photo.label}`}
                  fill
                  sizes="224px"
                  className="object-cover"
                  quality={65}
                />
              </div>
            ) : (
              <div className="aspect-[4/3] rounded-xl border border-dashed border-edge bg-gradient-to-br from-primary/8 to-accent/12 p-2">
                <div className="flex h-full items-center justify-center rounded-lg bg-surface/75 text-center text-xs font-medium text-muted">
                  {photo.label}
                </div>
              </div>
            )}
            <p className="mt-2 truncate text-sm font-semibold text-ink">{photo.title}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
