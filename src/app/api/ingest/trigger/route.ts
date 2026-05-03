import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { fetchRssFeed } from "@/lib/ingestion/rss-fetcher";
import { deduplicateItems } from "@/lib/ingestion/deduplicator";
import { storeItems } from "@/lib/ingestion/normalizer";
import { enrichItem, publishEnrichedItems } from "@/lib/ingestion/enricher";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sources = await db.source.findMany({
    where: { active: true, rssUrl: { not: null } },
  });

  let totalFetched = 0;
  let totalNew = 0;
  let totalEnriched = 0;

  for (const source of sources) {
    if (!source.rssUrl) continue;
    try {
      const items = await fetchRssFeed(source.rssUrl);
      totalFetched += items.length;
      const newItems = await deduplicateItems(items);
      totalNew += newItems.length;
      const stored = await storeItems(source.id, newItems);
      for (const record of stored) {
        await enrichItem(record.id);
        totalEnriched++;
      }
    } catch (err) {
      console.error({ sourceId: source.id, error: err instanceof Error ? err.message : String(err) });
    }
  }

  const published = await publishEnrichedItems();
  return NextResponse.json({ ok: true, totalFetched, totalNew, totalEnriched, published });
}
