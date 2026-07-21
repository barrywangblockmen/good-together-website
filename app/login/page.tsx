import { Suspense } from "react";
import { LoginForm } from "@/components/forms/login-form";
import { createMetadata } from "@/lib/metadata";

export const metadata = createMetadata({
  title: "會員登入",
  description: "以 Email 驗證登入 GT 俱樂部會員專區。",
  path: "/login",
});

export default function LoginPage() {
  return (
    <div>
      <section className="mesh-bg border-b border-edge">
        <div className="mx-auto max-w-6xl px-4 py-16 text-center md:px-6 md:py-20">
          <p className="text-sm text-muted">Member Login</p>
          <h1 className="mt-3 text-balance text-4xl font-semibold tracking-tight text-ink md:text-5xl">
            會員登入
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-pretty text-base leading-relaxed text-muted">
            輸入白名單中的 Email，我們會寄送一次性登入連結給您，無需密碼。
          </p>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-4 py-12 md:px-6">
        <Suspense
          fallback={
            <div className="mx-auto h-48 max-w-md animate-pulse rounded-2xl border border-edge bg-surface" />
          }
        >
          <LoginForm />
        </Suspense>
      </section>
    </div>
  );
}
