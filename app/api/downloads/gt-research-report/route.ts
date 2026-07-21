import { readFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { AuthError, requireMember } from "@/lib/auth-session";

const DOWNLOAD_PATH = path.join(
  process.cwd(),
  "assets/member-downloads/gt-research-report-skill.zip"
);

export async function GET() {
  try {
    await requireMember();
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ ok: false, error: e.code }, { status: 401 });
    }
    throw e;
  }

  try {
    const buffer = await readFile(DOWNLOAD_PATH);
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition":
          'attachment; filename="gt-research-report-skill.zip"',
        "Cache-Control": "private, no-store",
      },
    });
  } catch {
    return NextResponse.json(
      { ok: false, error: "FILE_NOT_FOUND" },
      { status: 404 }
    );
  }
}
