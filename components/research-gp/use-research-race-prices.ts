"use client";

import { useCallback, useEffect, useState } from "react";
import { msUntilNextPriceRefresh } from "@/lib/aitgp-chart";

export type ResearchPriceSnapshot = {
  prices: Record<string, number>;
  updatedAt: string;
  unsupported: string[];
};

export function useResearchRacePrices() {
  const [snapshot, setSnapshot] = useState<ResearchPriceSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const response = await fetch("/api/research-gp/prices");
      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(body?.error ?? `HTTP ${response.status}`);
      }
      const data = (await response.json()) as ResearchPriceSnapshot;
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
      }, msUntilNextPriceRefresh());
    };
    scheduleNext();

    return () => window.clearTimeout(timeoutId);
  }, [refresh]);

  return { snapshot, loading, error, refresh };
}
