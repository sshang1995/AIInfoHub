import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { APP_URL } from "@/lib/constants";

export const runtime = "nodejs";

export async function GET(req: NextRequest): Promise<NextResponse> {
  const token = req.nextUrl.searchParams.get("token");

  if (!token || token.length !== 64) {
    return NextResponse.redirect(`${APP_URL}/newsletter?error=invalid_token`);
  }

  try {
    const subscriber = await db.subscriber.findUnique({
      where: { confirmToken: token },
    });

    if (!subscriber) {
      return NextResponse.redirect(`${APP_URL}/newsletter?error=invalid_token`);
    }

    if (subscriber.status === "ACTIVE") {
      return NextResponse.redirect(`${APP_URL}/newsletter/confirmed?already=1`);
    }

    await db.subscriber.update({
      where: { email: subscriber.email },
      data: {
        status: "ACTIVE",
        confirmToken: null,
        confirmedAt: new Date(),
      },
    });

    return NextResponse.redirect(`${APP_URL}/newsletter/confirmed`);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal error";
    console.error("[newsletter/confirm]", { token: token.slice(0, 8), error: message });
    return NextResponse.redirect(`${APP_URL}/newsletter?error=server_error`);
  }
}
