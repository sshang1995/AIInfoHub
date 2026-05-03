import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { APP_URL } from "@/lib/constants";
import { z } from "zod";

export const runtime = "nodejs";

const unsubSchema = z.object({
  email: z.string().email(),
});

// GET — one-click unsubscribe from email link: /api/newsletter/unsubscribe?email=...
export async function GET(req: NextRequest): Promise<NextResponse> {
  const email = req.nextUrl.searchParams.get("email");

  const parsed = unsubSchema.safeParse({ email });
  if (!parsed.success) {
    return NextResponse.redirect(`${APP_URL}/newsletter?error=invalid_email`);
  }

  try {
    await db.subscriber.update({
      where: { email: parsed.data.email },
      data: { status: "UNSUBSCRIBED", unsubscribedAt: new Date() },
    });

    return NextResponse.redirect(`${APP_URL}/newsletter/unsubscribed`);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal error";
    console.error("[newsletter/unsubscribe]", { email, error: message });
    // Subscriber not found — treat as success (idempotent)
    return NextResponse.redirect(`${APP_URL}/newsletter/unsubscribed`);
  }
}

// POST — programmatic unsubscribe
export async function POST(req: NextRequest): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = unsubSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: "Invalid email" }, { status: 400 });
  }

  try {
    await db.subscriber.update({
      where: { email: parsed.data.email },
      data: { status: "UNSUBSCRIBED", unsubscribedAt: new Date() },
    });

    return NextResponse.json({ success: true });
  } catch {
    // Treat not-found as success (idempotent)
    return NextResponse.json({ success: true });
  }
}
