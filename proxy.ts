import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/** 常見自動化掃描路徑：直接拒絕以降低噪音與資訊外洩風險 */
const DENIED_PREFIXES = [
  "/.git",
  "/.svn",
  "/.hg",
  "/.aws",
  "/wp-admin",
  "/wp-includes",
  "/wp-content",
  "/wordpress",
  "/phpmyadmin",
  "/pma",
  "/administrator",
] as const;

function isDeniedPath(pathname: string): boolean {
  const p = pathname.toLowerCase();

  if (p.includes("%2e%2e") || p.includes("..")) {
    return true;
  }

  if (p.startsWith("/.env") || /^\/\.env(\.|$|\/)/.test(p)) {
    return true;
  }

  for (const prefix of DENIED_PREFIXES) {
    if (p === prefix || p.startsWith(`${prefix}/`)) {
      return true;
    }
  }

  return false;
}

export function proxy(request: NextRequest) {
  if (isDeniedPath(request.nextUrl.pathname)) {
    return new NextResponse(null, { status: 404 });
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?)$).*)",
  ],
};
