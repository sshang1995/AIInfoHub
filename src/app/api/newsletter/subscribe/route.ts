import { db } from "@/lib/db";
import { getResend, FROM_EMAIL } from "@/lib/resend";
import { APP_URL } from "@/lib/constants";
import { render } from "@react-email/render";
import ConfirmationEmail from "@/emails/ConfirmationEmail";
import React from "react";
import { randomBytes } from "crypto";
import { z } from "zod";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const subscribeSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export async function POST(req: NextRequest): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = subscribeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const { email } = parsed.data;

  try {
    // Check if already ACTIVE
    const existing = await db.subscriber.findUnique({ where: { email } });
    if (existing?.status === "ACTIVE") {
      return NextResponse.json(
        { success: false, error: "Already subscribed" },
        { status: 409 }
      );
    }

    const confirmToken = randomBytes(32).toString("hex");

    // Upsert: create new or refresh token for PENDING/UNSUBSCRIBED
    await db.subscriber.upsert({
      where: { email },
      create: { email, confirmToken, status: "PENDING" },
      update: { confirmToken, status: "PENDING", unsubscribedAt: null },
    });

    const confirmUrl = `${APP_URL}/api/newsletter/confirm?token=${confirmToken}`;
    const html = await render(React.createElement(ConfirmationEmail, { confirmUrl }));
    const text = `Confirm your AIInfoHub subscription:\n\n${confirmUrl}\n\nIf you didn't sign up, ignore this email.`;

    await getResend().emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: "Confirm your AIInfoHub subscription",
      html,
      text,
    });

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal error";
    console.error("[newsletter/subscribe]", { email, error: message });
    return NextResponse.json({ success: false, error: "Failed to subscribe" }, { status: 500 });
  }
}
