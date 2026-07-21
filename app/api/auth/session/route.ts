import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth-session";

export const runtime = "nodejs";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ ok: true, session: null });
  }
  return NextResponse.json({
    ok: true,
    session: { email: session.email, role: session.role },
  });
}
