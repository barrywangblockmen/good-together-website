import { WhitelistManager } from "@/components/admin/whitelist-manager";
import { createMetadata } from "@/lib/metadata";

export const metadata = createMetadata({
  title: "白名單管理",
  description: "管理可登入的會員與管理員 Email。",
  path: "/admin/whitelist",
});

export default function AdminWhitelistPage() {
  return (
    <div>
      <section className="border-b border-edge">
        <div className="mx-auto max-w-6xl px-4 py-10 md:px-6">
          <h1 className="text-2xl font-semibold tracking-tight text-ink md:text-3xl">
            白名單管理
          </h1>
          <p className="mt-2 text-muted">
            只有白名單中的 Email 才能透過驗證信登入。
          </p>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-4 py-8 md:px-6">
        <WhitelistManager />
      </section>
    </div>
  );
}
