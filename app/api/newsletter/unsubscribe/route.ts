import { NextResponse } from "next/server";
import { getNewsletterTopicLabel } from "@/lib/newsletter-topics";
import { unsubscribeByToken } from "@/lib/subscriber-log";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token")?.trim();

  if (!token) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  try {
    const result = await unsubscribeByToken(token);
    if (!result.ok) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    const labels = result.topicIds.map((id) => getNewsletterTopicLabel(id));
    const params = new URLSearchParams();
    if (labels.length > 0) {
      params.set("topics", labels.join("、"));
    }

    const dest = new URL("/newsletter/unsubscribed", request.url);
    dest.search = params.toString();
    return NextResponse.redirect(dest);
  } catch {
    return NextResponse.redirect(new URL("/", request.url));
  }
}
