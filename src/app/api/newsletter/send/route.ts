import { db } from "@/lib/db";
import { getResend, FROM_EMAIL } from "@/lib/resend";
import { APP_URL, TOPIC_COLORS } from "@/lib/constants";
import { render } from "@react-email/render";
import DigestEmail, { type DigestItem } from "@/emails/DigestEmail";
import React from "react";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 300;

const BATCH_SIZE = 50;

export async function POST(req: NextRequest): Promise<NextResponse> {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const start = Date.now();

  try {
    // Use last successful campaign's send time as the lower bound so we never
    // resend items already included in a previous newsletter. Fall back to 48h.
    const lastCampaign = await db.newsletterCampaign.findFirst({
      where: { status: "SENT" },
      orderBy: { sendDate: "desc" },
    });
    const fallbackSince = new Date(Date.now() - 48 * 60 * 60 * 1000);
    const since = lastCampaign ? lastCampaign.sendDate : fallbackSince;

    const contentItems = await db.contentItem.findMany({
      where: {
        status: "PUBLISHED",
        publishedAt: { gte: since },
        score: { gte: 0.5 },
      },
      include: { topics: { include: { topic: true } } },
      orderBy: { score: "desc" },
      take: 10,
    });

    if (contentItems.length === 0) {
      return NextResponse.json({ success: true, sent: 0, reason: "no_content" });
    }

    const dateStr = new Date().toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const items: DigestItem[] = contentItems.map((item) => {
      const firstTopic = item.topics[0]?.topic;
      return {
        title: item.title,
        sourceUrl: item.url,
        summaryEn: item.summary ?? item.title,
        developerTakeaway: item.developerTakeaway,
        topicName: firstTopic?.name ?? "AI",
        topicColor: firstTopic ? (TOPIC_COLORS[firstTopic.slug] ?? "#15803D") : "#15803D",
      };
    });

    // Get confirmed subscribers
    const subscribers = await db.subscriber.findMany({
      where: { status: "ACTIVE" },
      select: { email: true },
    });

    if (subscribers.length === 0) {
      return NextResponse.json({ success: true, sent: 0, reason: "no_subscribers" });
    }

    // Create campaign record
    const htmlBody = await render(
      React.createElement(DigestEmail, {
        date: dateStr,
        items,
        unsubscribeUrl: `${APP_URL}/api/newsletter/unsubscribe?email=PLACEHOLDER`,
      })
    );

    const campaign = await db.newsletterCampaign.create({
      data: {
        sendDate: new Date(),
        subject: `AI Digest — ${dateStr}`,
        htmlBody,
        status: "SENDING",
      },
    });

    // Send in batches
    let totalSent = 0;
    let totalFailed = 0;

    for (let i = 0; i < subscribers.length; i += BATCH_SIZE) {
      const batch = subscribers.slice(i, i + BATCH_SIZE);

      await Promise.allSettled(
        batch.map(async ({ email }) => {
          const unsubUrl = `${APP_URL}/api/newsletter/unsubscribe?email=${encodeURIComponent(email)}`;
          const personalizedHtml = await render(
            React.createElement(DigestEmail, { date: dateStr, items, unsubscribeUrl: unsubUrl })
          );

          try {
            await getResend().emails.send({
              from: FROM_EMAIL,
              to: email,
              subject: `AI Digest — ${dateStr}`,
              html: personalizedHtml,
            });

            await db.newsletterDelivery.create({
              data: { campaignId: campaign.id, subscriberEmail: email, status: "sent", sentAt: new Date() },
            });
            totalSent++;
          } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "unknown";
            await db.newsletterDelivery.create({
              data: {
                campaignId: campaign.id,
                subscriberEmail: email,
                status: "failed",
                errorMessage: message,
              },
            });
            totalFailed++;
          }
        })
      );
    }

    await db.newsletterCampaign.update({
      where: { id: campaign.id },
      data: { status: "SENT" },
    });

    const ms = Date.now() - start;
    console.info("[newsletter/send]", {
      campaignId: campaign.id,
      totalSent,
      totalFailed,
      itemCount: items.length,
      ms,
    });

    return NextResponse.json({ success: true, campaignId: campaign.id, totalSent, totalFailed, ms });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal error";
    console.error("[newsletter/send]", { error: message });
    return NextResponse.json({ success: false, error: "Send failed" }, { status: 500 });
  }
}
