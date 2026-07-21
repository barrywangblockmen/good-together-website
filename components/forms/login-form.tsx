"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";

const formSchema = z.object({
  email: z.string().trim().email("請填寫有效 Email"),
  website: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

function sanitizeNext(next: string | null): string {
  if (!next) return "/";
  const value = next.trim();
  if (!value.startsWith("/") || value.startsWith("//")) return "/";
  return value;
}

export function LoginForm() {
  const searchParams = useSearchParams();
  const nextPath = useMemo(
    () => sanitizeNext(searchParams.get("next")),
    [searchParams]
  );
  const errorParam = searchParams.get("error");

  const [done, setDone] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "", website: "" },
  });

  const errorMessage = useMemo(() => {
    if (serverError) return serverError;
    if (errorParam === "expired") return "登入連結已過期，請重新申請。";
    if (errorParam === "used") return "登入連結已使用過，請重新申請。";
    if (errorParam === "invalid") return "登入連結無效，請重新申請。";
    if (errorParam === "forbidden") return "您沒有權限存取該頁面。";
    return null;
  }, [errorParam, serverError]);

  async function onSubmit(values: FormValues) {
    setServerError(null);
    setDone(false);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: values.email,
          website: values.website,
          next: nextPath,
        }),
      });

      if (res.status === 204) {
        setDone(true);
        return;
      }

      const json = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !json.ok) {
        if (json.error === "RATE_LIMIT") {
          setServerError("嘗試次數過多，請稍後再試。");
        } else {
          setServerError("無法送出登入請求，請稍後再試。");
        }
        return;
      }
      setDone(true);
    } catch {
      setServerError("無法連線，請稍後再試。");
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="relative mx-auto w-full max-w-md space-y-5 rounded-2xl border border-edge bg-surface p-6 shadow-sm"
      noValidate
    >
      {errorMessage ? (
        <p
          className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-200"
          role="alert"
        >
          {errorMessage}
        </p>
      ) : null}

      {done ? (
        <div className="space-y-2 text-center">
          <p className="text-base font-medium text-ink">請查收您的信箱</p>
          <p className="text-sm leading-relaxed text-muted">
            若您在會員白名單中，我們已寄出登入連結（15 分鐘內有效）。請點擊信中連結完成登入。
          </p>
        </div>
      ) : (
        <>
          <div>
            <label htmlFor="login-email" className="mb-1.5 block text-sm font-medium text-ink">
              Email
            </label>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              className="w-full rounded-xl border border-edge bg-page px-3 py-2.5 text-sm text-ink outline-none ring-ring focus:ring-2"
              placeholder="you@example.com"
              {...register("email")}
            />
            {errors.email ? (
              <p className="mt-1.5 text-sm text-rose-600">{errors.email.message}</p>
            ) : null}
          </div>

          {/* honeypot */}
          <div className="absolute -left-[9999px] opacity-0" aria-hidden>
            <label htmlFor="login-website">Website</label>
            <input id="login-website" type="text" tabIndex={-1} autoComplete="off" {...register("website")} />
          </div>

          <Button type="submit" className="w-full justify-center" loading={isSubmitting}>
            寄送登入連結
          </Button>
        </>
      )}
    </form>
  );
}
