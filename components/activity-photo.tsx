"use client";

import { useEffect, useState } from "react";

type ActivityPhotoProps = {
  src: string;
  alt: string;
  sizes: string;
  className?: string;
};

const MAX_RETRIES = 3;

export function ActivityPhoto({ src, alt, className }: ActivityPhotoProps) {
  const [attempt, setAttempt] = useState(0);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setAttempt(0);
    setFailed(false);
  }, [src]);

  if (failed) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/8 to-accent/12 text-center text-xs font-medium text-muted">
        活動照片
      </div>
    );
  }

  const cacheBust = attempt > 0 ? `${src}${src.includes("?") ? "&" : "?"}r=${attempt}` : src;

  return (
    // eslint-disable-next-line @next/next/no-img-element -- static public JPEGs; native img avoids optimizer and supports retry on 503
    <img
      key={cacheBust}
      src={cacheBust}
      alt={alt}
      loading="lazy"
      decoding="async"
      className={className ?? "absolute inset-0 h-full w-full object-cover"}
      onError={() => {
        if (attempt < MAX_RETRIES) {
          window.setTimeout(() => setAttempt((value) => value + 1), 250 * (attempt + 1));
          return;
        }
        setFailed(true);
      }}
    />
  );
}
