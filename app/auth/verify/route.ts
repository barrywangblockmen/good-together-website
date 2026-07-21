import { NextResponse } from "next/server";
import {
  applySessionCookie,
  buildSessionPayload,
} from "@/lib/auth-session";
import { consumeLoginToken } from "@/lib/auth-token";
import { getPublicSiteUrl } from "@/lib/site-url";
import { findByEmail } from "@/lib/whitelist-log";

export const runtime = "nodejs";

function sanitizeNext(next: string | null): string {
  if (!next) return "/";
  const value = next.trim();
  if (!value.startsWith("/") || value.startsWith("//")) return "/";
  return value;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token") || "";
  const nextPath = sanitizeNext(url.searchParams.get("next"));
  // Behind nginx, request.url origin may be 0.0.0.0:3000 — never use it for redirects.
  const siteUrl = getPublicSiteUrl(request);

  const consumed = await consumeLoginToken(token);
  if (!consumed.ok) {
    const loginUrl = new URL("/login", siteUrl);
    loginUrl.searchParams.set("error", consumed.error.toLowerCase());
    return NextResponse.redirect(loginUrl);
  }

  const record = await findByEmail(consumed.email);
  if (!record) {
    const loginUrl = new URL("/login", siteUrl);
    loginUrl.searchParams.set("error", "forbidden");
    return NextResponse.redirect(loginUrl);
  }

  const payload = buildSessionPayload(record.email, record.role);
  const redirectUrl = new URL(nextPath, siteUrl);
  const response = NextResponse.redirect(redirectUrl);
  applySessionCookie(response, payload);
  return response;
}
