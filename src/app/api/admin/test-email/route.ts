import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getResend, FROM_EMAIL } from "@/lib/resend";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const to = url.searchParams.get("to") ?? "shushang0901@gmail.com";

  try {
    const result = await getResend().emails.send({
      from: FROM_EMAIL,
      to,
      subject: "AIInfoHub diagnostic test",
      html: "<p>If you see this, Resend is working.</p>",
      text: "If you see this, Resend is working.",
    });

    return NextResponse.json({
      ok: true,
      from: FROM_EMAIL,
      to,
      result,
    });
  } catch (err) {
    return NextResponse.json({
      ok: false,
      from: FROM_EMAIL,
      to,
      name: err instanceof Error ? err.name : undefined,
      error: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack?.split("\n").slice(0, 5) : undefined,
    }, { status: 500 });
  }
}
