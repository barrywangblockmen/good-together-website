"use client";

import { useCallback, useEffect, useState } from "react";
import type { AitgpPriceSnapshot } from "@/lib/aitgp-chart";
import { msUntilNextTaipeiHour } from "@/lib/aitgp-chart";

export function useAitgpPrices() {
  const [snapshot, setSnapshot] = useState<AitgpPriceSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/aitgp/prices");
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(body?.error ?? `HTTP ${res.status}`);
      }
      const data = (await res.json()) as AitgpPriceSnapshot;
      setSnapshot(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "行情載入失敗");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();

    let timeoutId = 0;
    const scheduleNext = () => {
      timeoutId = window.setTimeout(() => {
        void refresh();
        scheduleNext();
      }, msUntilNextTaipeiHour());
    };
    scheduleNext();

    return () => window.clearTimeout(timeoutId);
  }, [refresh]);

  return { snapshot, loading, error, refresh };
}
