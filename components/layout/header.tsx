"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { NAV_LINKS } from "@/lib/constants";
import { LogoLink } from "@/components/layout/logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Button } from "@/components/ui/button";
import type { WhitelistRole } from "@/lib/schemas/auth";

export type HeaderSession = {
  email: string;
  role: WhitelistRole;
} | null;

type NavItem = {
  href: string;
  label: string;
  highlight?: boolean;
};

export function Header({ session }: { session: HeaderSession }) {
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const router = useRouter();

  const links = useMemo(() => {
    return [...NAV_LINKS] satisfies NavItem[];
  }, []);

  const isAdmin = session?.role === "admin";

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.refresh();
      router.push("/");
    } finally {
      setLoggingOut(false);
      setOpen(false);
    }
  }

  return (
    <header className="sticky top-0 z-40 border-b border-edge/80 bg-page/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 md:px-6">
        <LogoLink />
        <nav className="hidden items-center gap-1 md:flex" aria-label="主選單">
          {links.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={
                item.highlight
                  ? "rounded-full bg-gradient-to-r from-rose-500 to-amber-500 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:brightness-110 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-page"
                  : "rounded-full px-3 py-2 text-sm text-muted transition hover:bg-surface-elevated hover:text-ink"
              }
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {isAdmin ? (
            <Link
              href="/admin"
              className="inline-flex size-10 items-center justify-center rounded-full border border-edge bg-surface text-ink transition hover:border-primary-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="管理員後台"
              title="管理員後台"
              onClick={() => setOpen(false)}
            >
              <AdminIcon />
            </Link>
          ) : null}
          {session ? (
            <Button
              type="button"
              variant="outline"
              className="hidden md:inline-flex"
              loading={loggingOut}
              onClick={() => void handleLogout()}
            >
              登出
            </Button>
          ) : (
            <Button href="/login" variant="outline" className="hidden md:inline-flex">
              會員登入
            </Button>
          )}
          <Button href="/join" variant="primary" className="hidden md:inline-flex">
            加入協會
          </Button>
          <button
            type="button"
            className="inline-flex size-10 items-center justify-center rounded-full border border-edge bg-surface md:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "關閉選單" : "開啟選單"}
            onClick={() => setOpen((v) => !v)}
          >
            <span className="sr-only">選單</span>
            {open ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>

      {open ? (
        <div
          id="mobile-nav"
          className="border-t border-edge bg-page md:hidden"
          role="dialog"
          aria-modal="true"
        >
          <nav className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-4" aria-label="手機主選單">
            {links.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={
                  item.highlight
                    ? "rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 px-3 py-3 text-base font-semibold text-white shadow-sm"
                    : "rounded-xl px-3 py-3 text-base text-ink hover:bg-surface-elevated"
                }
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            {session ? (
              <Button
                type="button"
                variant="outline"
                className="mt-2 w-full justify-center"
                loading={loggingOut}
                onClick={() => void handleLogout()}
              >
                登出
              </Button>
            ) : (
              <Button
                href="/login"
                variant="outline"
                className="mt-2 w-full justify-center"
                onClick={() => setOpen(false)}
              >
                會員登入
              </Button>
            )}
            <Button
              href="/join"
              variant="primary"
              className="mt-2 w-full justify-center"
              onClick={() => setOpen(false)}
            >
              加入協會
            </Button>
          </nav>
        </div>
      ) : null}
    </header>
  );
}

function MenuIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 7h16M4 12h16M4 17h16"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M6 6l12 12M18 6L6 18"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function AdminIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9c.26.6.84 1 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
    </svg>
  );
}
