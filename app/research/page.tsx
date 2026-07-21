import { createMetadata } from "@/lib/metadata";

export const metadata = createMetadata({
  title: "學術研究",
  description: "GT 俱樂部會員專屬學術研究內容。",
  path: "/research",
});

export default function ResearchPage() {
  return (
    <div>
      <section className="mesh-bg border-b border-edge">
        <div className="mx-auto max-w-6xl px-4 py-16 text-center md:px-6 md:py-24">
          <p className="text-sm text-muted">Member Exclusive</p>
          <h1 className="mt-3 text-balance text-4xl font-semibold tracking-tight text-ink md:text-6xl">
            學術研究
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-pretty text-lg leading-relaxed text-muted">
            此為會員專屬頁面。學術研究內容建置中，敬請期待。
          </p>
        </div>
      </section>
      <section className="mx-auto max-w-3xl px-4 py-16 md:px-6">
        <div className="rounded-2xl border border-dashed border-edge bg-surface px-6 py-12 text-center">
          <p className="text-base text-muted">
            後續將於此處提供研究摘要、論文與相關資源。
          </p>
        </div>
      </section>
    </div>
  );
}
