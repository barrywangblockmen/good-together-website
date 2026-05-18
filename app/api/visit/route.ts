import { NextResponse } from "next/server";

export const runtime = "nodejs";

/** Visit notifications are disabled; contact form emails remain active. */
export async function POST() {
  return new NextResponse(null, { status: 204 });
}
