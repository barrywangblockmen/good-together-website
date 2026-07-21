import { NextResponse } from "next/server";
import { AuthError, requireAdmin } from "@/lib/auth-session";
import {
  addWhitelistBodySchema,
  removeWhitelistBodySchema,
} from "@/lib/schemas/auth";
import {
  addEmail,
  listAll,
  removeEmail,
} from "@/lib/whitelist-log";

export const runtime = "nodejs";

function authErrorResponse(error: unknown) {
  if (error instanceof AuthError) {
    return NextResponse.json(
      { ok: false, error: error.code },
      { status: error.code === "FORBIDDEN" ? 403 : 401 }
    );
  }
  return NextResponse.json({ ok: false, error: "SERVER_ERROR" }, { status: 500 });
}

export async function GET() {
  try {
    await requireAdmin();
    const records = await listAll();
    return NextResponse.json({ ok: true, records });
  } catch (error) {
    return authErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireAdmin();
    let json: unknown;
    try {
      json = await request.json();
    } catch {
      return NextResponse.json(
        { ok: false, error: "VALIDATION_ERROR", details: ["body"] },
        { status: 400 }
      );
    }

    const parsed = addWhitelistBodySchema.safeParse(json);
    if (!parsed.success) {
      const details = parsed.error.issues.map(
        (i) => i.path.join(".") || "field"
      );
      return NextResponse.json(
        { ok: false, error: "VALIDATION_ERROR", details },
        { status: 400 }
      );
    }

    const result = await addEmail({
      email: parsed.data.email,
      role: parsed.data.role,
      createdBy: session.email,
    });

    if (!result.ok) {
      return NextResponse.json(
        { ok: false, error: result.error },
        { status: 409 }
      );
    }

    const records = await listAll();
    return NextResponse.json({ ok: true, records });
  } catch (error) {
    return authErrorResponse(error);
  }
}

export async function DELETE(request: Request) {
  try {
    await requireAdmin();
    let json: unknown;
    try {
      json = await request.json();
    } catch {
      return NextResponse.json(
        { ok: false, error: "VALIDATION_ERROR", details: ["body"] },
        { status: 400 }
      );
    }

    const parsed = removeWhitelistBodySchema.safeParse(json);
    if (!parsed.success) {
      const details = parsed.error.issues.map(
        (i) => i.path.join(".") || "field"
      );
      return NextResponse.json(
        { ok: false, error: "VALIDATION_ERROR", details },
        { status: 400 }
      );
    }

    const result = await removeEmail(parsed.data.email);
    if (!result.ok) {
      const status = result.error === "NOT_FOUND" ? 404 : 409;
      return NextResponse.json(
        { ok: false, error: result.error },
        { status }
      );
    }

    const records = await listAll();
    return NextResponse.json({ ok: true, records });
  } catch (error) {
    return authErrorResponse(error);
  }
}
