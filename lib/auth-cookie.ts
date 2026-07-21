import { createHmac, timingSafeEqual } from "node:crypto";
import type { NextRequest, NextResponse } from "next/server";
import type { WhitelistRole } from "@/lib/schemas/auth";

export const SESSION_COOKIE = "gt_session";

export type SessionPayload = {
  email: string;
  role: WhitelistRole;
  exp: number;
};

function getAuthSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error("AUTH_SECRET is missing or too short");
  }
  return secret;
}

function getSessionDays(): number {
  const raw = Number(process.env.AUTH_SESSION_DAYS || "30");
  if (!Number.isFinite(raw) || raw <= 0) return 30;
  return Math.min(raw, 365);
}

function toBase64Url(buf: Buffer | string): string {
  const b = typeof buf === "string" ? Buffer.from(buf, "utf8") : buf;
  return b.toString("base64url");
}

function signPayload(payloadB64: string): string {
  return createHmac("sha256", getAuthSecret())
    .update(payloadB64)
    .digest("base64url");
}

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

export function encodeSession(payload: SessionPayload): string {
  const payloadB64 = toBase64Url(JSON.stringify(payload));
  const sig = signPayload(payloadB64);
  return `${payloadB64}.${sig}`;
}

export function decodeSession(value: string | undefined | null): SessionPayload | null {
  if (!value) return null;
  const parts = value.split(".");
  if (parts.length !== 2) return null;
  const [payloadB64, sig] = parts;
  if (!payloadB64 || !sig) return null;

  let expected: string;
  try {
    expected = signPayload(payloadB64);
  } catch {
    return null;
  }
  if (!safeEqual(sig, expected)) return null;

  try {
    const json = Buffer.from(payloadB64, "base64url").toString("utf8");
    const payload = JSON.parse(json) as SessionPayload;
    if (
      typeof payload.email !== "string" ||
      (payload.role !== "member" && payload.role !== "admin") ||
      typeof payload.exp !== "number"
    ) {
      return null;
    }
    if (payload.exp <= Date.now()) return null;
    return {
      email: payload.email.trim().toLowerCase(),
      role: payload.role,
      exp: payload.exp,
    };
  } catch {
    return null;
  }
}

/** Verify without throwing if AUTH_SECRET missing. */
export function decodeSessionSafe(
  value: string | undefined | null
): SessionPayload | null {
  try {
    return decodeSession(value);
  } catch {
    return null;
  }
}

export function buildSessionPayload(
  email: string,
  role: WhitelistRole
): SessionPayload {
  const days = getSessionDays();
  return {
    email: email.trim().toLowerCase(),
    role,
    exp: Date.now() + days * 24 * 60 * 60 * 1000,
  };
}

function cookieOptions(maxAgeSeconds: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: maxAgeSeconds,
  };
}

export function applySessionCookie(
  response: NextResponse,
  payload: SessionPayload
): void {
  const token = encodeSession(payload);
  const maxAge = Math.max(0, Math.floor((payload.exp - Date.now()) / 1000));
  response.cookies.set(SESSION_COOKIE, token, cookieOptions(maxAge));
}

export function clearSessionCookie(response: NextResponse): void {
  response.cookies.set(SESSION_COOKIE, "", {
    ...cookieOptions(0),
    maxAge: 0,
  });
}

export function getSessionFromRequest(request: NextRequest): SessionPayload | null {
  return decodeSessionSafe(request.cookies.get(SESSION_COOKIE)?.value);
}

export function isMember(session: SessionPayload | null): boolean {
  return session?.role === "member" || session?.role === "admin";
}

export function isAdmin(session: SessionPayload | null): boolean {
  return session?.role === "admin";
}
