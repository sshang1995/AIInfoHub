import { NextRequest, NextResponse } from "next/server";
import { APP_URL } from "@/lib/constants";

export const runtime = "nodejs";

// Triggered by Vercel Cron — see vercel.json
export async function GET(req: NextRequest): Promise<NextResponse> {
  const isCron = req.headers.get("x-vercel-cron") === "1";
  const authHeader = req.headers.get("authorization");
  const isAuthorized = authHeader === `Bearer ${process.env.CRON_SECRET}`;

  if (!isCron && !isAuthorized) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const start = Date.now();
  console.info("[cron/daily-send] start", { ts: new Date().toISOString() });

  try {
    const res = await fetch(`${APP_URL}/api/newsletter/send`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.CRON_SECRET}`,
        "Content-Type": "application/json",
      },
    });

    const data = (await res.json()) as Record<string, unknown>;
    const ms = Date.now() - start;
    console.info("[cron/daily-send] done", { ...data, ms });

    return NextResponse.json({ success: true, ...data, ms });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal error";
    console.error("[cron/daily-send] error", { error: message });
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
