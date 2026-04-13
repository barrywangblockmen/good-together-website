import Link from "next/link";
import { SITE_NAME } from "@/lib/constants";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-auto border-t border-edge bg-surface">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-10 md:flex-row md:items-center md:justify-between md:px-6">
        <div>
          <p className="text-sm font-semibold text-ink">{SITE_NAME}</p>
          <p className="mt-1 text-sm text-muted">
            Good Together Club · 與科技、永續與彼此一起前行
          </p>
        </div>
        <nav className="flex flex-wrap gap-4 text-sm" aria-label="頁尾">
          <Link className="text-muted hover:text-ink" href="/privacy">
            隱私權政策
          </Link>
          <Link className="text-muted hover:text-ink" href="/join">
            加入意向表單
          </Link>
        </nav>
        <p className="text-xs text-muted">© {year} {SITE_NAME}</p>
      </div>
    </footer>
  );
}
