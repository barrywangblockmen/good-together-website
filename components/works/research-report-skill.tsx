import Link from "next/link";
import { Button } from "@/components/ui/button";

const FILES = [
  { name: "SKILL.md", hint: "規則與客觀性守則" },
  { name: "template.html", hint: "A4 雙欄版型" },
  { name: "render_pdf.py", hint: "HTML→PDF" },
  { name: "gt_logo.svg", hint: "品牌 logo" },
] as const;

export function ResearchReportSkill({ isMember }: { isMember: boolean }) {
  return (
    <div className="mt-6 rounded-xl border border-primary/20 bg-primary/5 px-4 py-4 md:px-5 md:py-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex size-9 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <ReportIcon />
            </span>
            <div>
              <h3 className="text-lg font-semibold text-ink">GT 投研報告 Skill</h3>
              <p className="text-xs font-medium text-primary">會員免費 · Claude Skill</p>
            </div>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            協助投資專員快速產出 GT 品牌格式研究報告。匯入 Claude 後，說「用 GT 投研格式做研究報告」即可觸發。
          </p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {FILES.map((f) => (
              <li
                key={f.name}
                className="rounded-lg border border-edge bg-page/80 px-2.5 py-1 text-xs text-muted"
                title={f.hint}
              >
                <span className="font-medium text-ink">{f.name}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="shrink-0">
          {isMember ? (
            <a
              href="/api/downloads/gt-research-report"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:brightness-110"
            >
              <DownloadIcon />
              下載 Skill
            </a>
          ) : (
            <Button href="/login?next=/works" variant="outline" className="text-sm">
              會員登入後下載
            </Button>
          )}
        </div>
      </div>

      <details className="group mt-4 rounded-lg border border-edge bg-page/70">
        <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-3 text-sm font-medium text-ink marker:content-none [&::-webkit-details-marker]:hidden">
          <ChevronIcon className="text-muted transition group-open:rotate-90" />
          匯入說明
          <span className="text-xs font-normal text-muted">（點開查看）</span>
        </summary>
        <div className="space-y-3 border-t border-edge px-4 py-3 text-sm leading-relaxed text-muted">
          <ol className="list-decimal space-y-2 pl-4">
            <li>解壓縮後得到 <code className="text-ink">gt-research-report/</code> 資料夾。</li>
            <li>
              放入 Claude Skills 目錄：自架環境通常是{" "}
              <code className="text-ink">/mnt/skills/user/</code>；桌面或網頁版則上傳資料夾或
              zip 即可。
            </li>
            <li>
              匯入後 skill 名稱為{" "}
              <code className="text-ink">gt-research-report</code>，即可開始使用。
            </li>
          </ol>
          <p className="rounded-lg border border-amber-400/30 bg-amber-400/5 px-3 py-2 text-xs leading-relaxed text-muted">
            <span className="font-medium text-ink">PDF 輸出（選用）：</span>
            {" "}
            <code className="text-ink">render_pdf.py</code> 需要 Playwright 與 Chromium。若尚未安裝，執行{" "}
            <code className="text-ink">pip install playwright</code> 後再{" "}
            <code className="text-ink">playwright install chromium</code>。報告版型與撰寫守則不受影響。
          </p>
          {!isMember ? (
            <p className="text-xs">
              還不是會員？{" "}
              <Link href="/join" className="font-medium text-primary hover:underline">
                了解如何加入
              </Link>
            </p>
          ) : null}
        </div>
      </details>
    </div>
  );
}

function ReportIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
      <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

function ChevronIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}
