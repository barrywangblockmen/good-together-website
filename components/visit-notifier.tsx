"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

export function VisitNotifier() {
  const pathname = usePathname();
  const prevPath = useRef<string | null>(null);

  useEffect(() => {
    const path = pathname || "/";
    if (prevPath.current === path) return;
    prevPath.current = path;

    const payload = {
      path,
      referrer: typeof document !== "undefined" ? document.referrer || "" : "",
      title: typeof document !== "undefined" ? document.title : "",
    };

    void fetch("/api/visit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {});
  }, [pathname]);

  return null;
}
