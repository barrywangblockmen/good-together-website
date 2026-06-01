"use client";

import Image from "next/image";
import { useState } from "react";

type ActivityPhotoProps = {
  src: string;
  alt: string;
  sizes: string;
  className?: string;
};

export function ActivityPhoto({ src, alt, sizes, className }: ActivityPhotoProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/8 to-accent/12 text-center text-xs font-medium text-muted">
        活動照片
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      className={className ?? "object-cover"}
      // Static JPEGs under public/activities are pre-compressed via photos:prepare.
      // Skip /_next/image to avoid intermittent optimizer timeouts on many parallel requests.
      unoptimized
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}
