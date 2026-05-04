import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { fetchRssFeed } from "@/lib/ingestion/rss-fetcher";
import { deduplicateItems } from "@/lib/ingestion/deduplicator";
import { storeItems } from "@/lib/ingestion/normalizer";
import { enrichItem, publishEnrichedItems } from "@/lib/ingestion/enricher";

export const runtime = "nodejs";
export const maxDuration = 300;

function verifyRequest(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const auth = req.headers.get("authorization");
  return auth === `Bearer ${secret}`;
}

export async function POST(req: NextRequest) {
  const start = Date.now();

  if (!verifyRequest(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  console.log(JSON.stringify({ level: "info", msg: "rss-ingest start" }));

  try {
    // Fetch all active RSS sources
    const sources = await db.source.findMany({
      where: { active: true, rssUrl: { not: null } },
    });

    let totalFetched = 0;
    let totalNew = 0;
    let totalEnriched = 0;

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    for (const source of sources) {
      if (!source.rssUrl) continue;

      try {
        const items = await fetchRssFeed(source.rssUrl);
        totalFetched += items.length;

        const newItems = await deduplicateItems(items);
        totalNew += newItems.length;

        // Only store and enrich articles published within the last 30 days
        const recentItems = newItems.filter(
          (item) => !item.publishedAt || item.publishedAt >= thirtyDaysAgo
        );

        const stored = await storeItems(source.id, recentItems);

        // Enrich each new item
        for (const record of stored) {
          await enrichItem(record.id);
          totalEnriched++;
        }
      } catch (err) {
        console.error(
          JSON.stringify({
            level: "error",
            msg: "source fetch failed",
            sourceId: source.id,
            sourceName: source.name,
            error: err instanceof Error ? err.message : String(err),
          })
        );
      }
    }

    // Publish all enriched items scoring above threshold
    const published = await publishEnrichedItems();

    const ms = Date.now() - start;
    console.log(
      JSON.stringify({
        level: "info",
        msg: "rss-ingest done",
        totalFetched,
        totalNew,
        totalEnriched,
        published,
        ms,
      })
    );

    return NextResponse.json({ ok: true, totalFetched, totalNew, totalEnriched, published, ms });
  } catch (error) {
    const ms = Date.now() - start;
    console.error(
      JSON.stringify({
        level: "error",
        msg: "rss-ingest fatal",
        error: error instanceof Error ? error.message : String(error),
        ms,
      })
    );
    return NextResponse.json({ error: "Ingestion failed" }, { status: 500 });
  }
}
