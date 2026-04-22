"use client";

import { useEffect, useState } from "react";

const TARGET_COUNT = 25;
const START_COUNT = 20;

export function SupporterCount() {
  const [count, setCount] = useState(START_COUNT);

  useEffect(() => {
    const totalSteps = TARGET_COUNT - START_COUNT;
    if (totalSteps <= 0) return;

    const intervalMs = 220;
    const timer = window.setInterval(() => {
      setCount((prev) => {
        if (prev >= TARGET_COUNT) {
          window.clearInterval(timer);
          return TARGET_COUNT;
        }
        return prev + 1;
      });
    }, intervalMs);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="mt-2 flex justify-center">
      <span key={count} className="supporter-count-roll text-4xl font-semibold text-primary md:text-5xl">
        {count}
      </span>
    </div>
  );
}
