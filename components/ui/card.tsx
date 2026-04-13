import type { ReactNode } from "react";

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-edge bg-surface p-6 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-primary-muted/60 hover:shadow-md ${className}`}
    >
      {children}
    </div>
  );
}
