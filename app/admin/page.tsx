import Link from "next/link";
import { Card } from "@/components/ui/card";
import { createMetadata } from "@/lib/metadata";

export const metadata = createMetadata({
  title: "管理員後台",
  description: "GT 俱樂部管理員後台。",
  path: "/admin",
});

export default function AdminPage() {
  return (
    <div>
      <section className="mesh-bg border-b border-edge">
        <div className="mx-auto max-w-6xl px-4 py-12 md:px-6 md:py-16">
          <p className="text-sm text-muted">Admin</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink md:text-4xl">
            管理員後台
          </h1>
          <p className="mt-3 max-w-2xl text-muted">
            管理會員白名單與其他後台功能。
          </p>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-4 py-10 md:px-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-ink">白名單管理</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              新增或移除可登入的會員 Email，並設定管理員權限。
            </p>
            <Link
              href="/admin/whitelist"
              className="mt-4 inline-flex text-sm font-medium text-primary hover:underline"
            >
              前往管理 →
            </Link>
          </Card>
        </div>
      </section>
    </div>
  );
}
