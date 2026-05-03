import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { enrichContent } from "@/lib/ai";

export const runtime = "nodejs";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const out = await enrichContent(
      "Anthropic ships Claude Sonnet 4.6",
      "Anthropic released a new model with stronger coding and agent capabilities. It supports a 200k context window and improved tool use.",
    );
    return NextResponse.json({ ok: true, output: out });
  } catch (err) {
    return NextResponse.json({
      ok: false,
      error: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack?.split("\n").slice(0, 5) : undefined,
      name: err instanceof Error ? err.name : undefined,
    }, { status: 500 });
  }
}
