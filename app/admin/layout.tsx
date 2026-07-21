import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { isAdmin, getSession } from "@/lib/auth-session";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getSession();
  if (!isAdmin(session)) {
    redirect("/login?next=/admin&error=forbidden");
  }

  return (
    <div>
      <div className="border-b border-edge bg-surface">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-3 text-sm md:px-6">
          <span className="font-semibold text-ink">管理員後台</span>
          <Link href="/admin" className="text-muted hover:text-ink">
            總覽
          </Link>
          <Link href="/admin/whitelist" className="text-muted hover:text-ink">
            白名單管理
          </Link>
          <span className="ml-auto text-muted">{session!.email}</span>
        </div>
      </div>
      {children}
    </div>
  );
}
