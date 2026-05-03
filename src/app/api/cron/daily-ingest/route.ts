import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * Called by Vercel Cron daily.
 * Proxies to the ingest endpoint so the actual work runs in a dedicated route.
 */
export async function GET(req: NextRequest) {
  const start = Date.now();
  const requestId = req.headers.get("x-vercel-id") ?? "local";
  const secret = process.env.CRON_SECRET;

  // Verify Vercel cron header
  const cronHeader = req.headers.get("x-vercel-cron");
  if (!cronHeader && !secret) {
    console.error(JSON.stringify({ level: "error", msg: "cron unauthorized", requestId }));
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  console.log(JSON.stringify({ level: "info", msg: "cron trigger start", requestId }));

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  try {
    const response = await fetch(`${appUrl}/api/ingest/rss`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${secret}`,
        "content-type": "application/json",
      },
    });

    const result = await response.json();
    console.log(
      JSON.stringify({ level: "info", msg: "cron trigger done", requestId, status: response.status, ms: Date.now() - start, ...result })
    );
    return NextResponse.json(result, { status: response.status });
  } catch (error) {
    console.error(
      JSON.stringify({ level: "error", msg: "cron trigger failed", requestId, error: error instanceof Error ? error.message : String(error), ms: Date.now() - start })
    );
    return NextResponse.json({ error: "Cron trigger failed" }, { status: 500 });
  }
}
