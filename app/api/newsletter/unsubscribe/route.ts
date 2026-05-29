import { NextResponse } from "next/server";
import { unsubscribeByToken } from "@/lib/subscriber-log";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token")?.trim();

  if (!token) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  try {
    const ok = await unsubscribeByToken(token);
    if (!ok) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  } catch {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.redirect(new URL("/newsletter/unsubscribed", request.url));
}
