import { cookies } from "next/headers";
import {
  decodeSessionSafe,
  isAdmin,
  isMember,
  SESSION_COOKIE,
  type SessionPayload,
} from "@/lib/auth-cookie";

export {
  SESSION_COOKIE,
  applySessionCookie,
  buildSessionPayload,
  clearSessionCookie,
  decodeSession,
  decodeSessionSafe,
  encodeSession,
  getSessionFromRequest,
  isAdmin,
  isMember,
  type SessionPayload,
} from "@/lib/auth-cookie";

export async function getSession(): Promise<SessionPayload | null> {
  try {
    const jar = await cookies();
    return decodeSessionSafe(jar.get(SESSION_COOKIE)?.value);
  } catch {
    return null;
  }
}

export async function requireMember(): Promise<SessionPayload> {
  const session = await getSession();
  if (!isMember(session)) {
    throw new AuthError("UNAUTHORIZED");
  }
  return session!;
}

export async function requireAdmin(): Promise<SessionPayload> {
  const session = await getSession();
  if (!isAdmin(session)) {
    throw new AuthError(session ? "FORBIDDEN" : "UNAUTHORIZED");
  }
  return session!;
}

export class AuthError extends Error {
  code: "UNAUTHORIZED" | "FORBIDDEN";
  constructor(code: "UNAUTHORIZED" | "FORBIDDEN") {
    super(code);
    this.code = code;
  }
}
