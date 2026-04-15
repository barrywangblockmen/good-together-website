import { Reveal } from "@/components/motion/reveal";
import Image from "next/image";
import { ACTIVITY_EVENTS, ACTIVITY_PHOTO_COUNT } from "@/lib/activities";
import { getActivityPhotoMap } from "@/lib/activity-photos";
import { createMetadata } from "@/lib/metadata";

export const metadata = createMetadata({
  title: "活動照片牆",
  description:
    "記錄台灣共好交流協會每一場活動的現場時刻，包含活動名稱、日期與精選照片。",
  path: "/activities",
});

export default async function ActivitiesPage() {
  const photoMap = await getActivityPhotoMap();

  return (
    <div>
      <section className="mesh-bg border-b border-edge">
        <div className="mx-auto max-w-6xl px-4 py-16 text-center md:px-6 md:py-24">
          <Reveal>
            <p className="text-sm text-muted">Activity Gallery</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-ink md:text-6xl">
              活動照片牆
            </h1>
            <p className="mx-auto mt-5 max-w-4xl text-pretty text-lg leading-relaxed text-muted">
              記錄我們一起走過的學習、合作與陪伴時刻。
            </p>
          </Reveal>
        </div>
      </section>

      <section className="border-t border-edge bg-page">
        <div className="mx-auto max-w-6xl px-4 py-14 md:px-6 md:py-20">
          <div className="grid gap-6 md:grid-cols-2">
            {ACTIVITY_EVENTS.map((activity, i) => (
              <Reveal key={activity.folder} delay={0.04 * i}>
                <article className="rounded-2xl border border-edge bg-surface-elevated/80 p-5 shadow-sm md:p-6">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                    <h2 className="text-2xl font-semibold text-ink">{activity.title}</h2>
                    <span className="inline-flex rounded-full bg-primary/12 px-3 py-1 text-xs font-semibold text-primary">
                      {activity.date}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-muted md:text-base">
                    {activity.description}
                  </p>

                  <div className="mt-5 grid grid-cols-2 gap-3">
                    {Array.from({ length: ACTIVITY_PHOTO_COUNT }).map((_, photoIndex) => {
                      const slot = photoMap[activity.folder]?.[photoIndex];
                      const alt = `${activity.title} 活動照片 ${photoIndex + 1}`;

                      if (slot?.src) {
                        return (
                          <div
                            key={`${activity.folder}-photo-${photoIndex + 1}`}
                            className="relative aspect-[4/3] overflow-hidden rounded-xl border border-edge"
                          >
                            <Image
                              src={slot.src}
                              alt={alt}
                              fill
                              sizes="(min-width: 768px) 25vw, 46vw"
                              className="object-cover"
                              quality={72}
                            />
                          </div>
                        );
                      }

                      return (
                        <div
                          key={`${activity.folder}-placeholder-${photoIndex + 1}`}
                          className="aspect-[4/3] rounded-xl border border-dashed border-edge bg-gradient-to-br from-primary/8 to-accent/12 p-3"
                        >
                          <div className="flex h-full items-center justify-center rounded-lg bg-surface/70 text-center text-xs font-medium text-muted">
                            活動照片
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
