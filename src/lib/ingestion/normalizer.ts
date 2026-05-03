import { db } from "@/lib/db";
import type { RssItem } from "./rss-fetcher";

export interface StoredItem {
  id: string;
  title: string;
  url: string;
}

/**
 * Persist a batch of new RSS items as PENDING content items.
 * Returns the IDs of created records for downstream enrichment.
 */
export async function storeItems(
  sourceId: string,
  items: RssItem[]
): Promise<StoredItem[]> {
  if (items.length === 0) return [];

  const created: StoredItem[] = [];

  for (const item of items) {
    try {
      const record = await db.contentItem.create({
        data: {
          sourceId,
          externalId: item.externalId,
          title: item.title,
          url: item.url,
          rawText: item.rawText,
          publishedAt: item.publishedAt,
          status: "PENDING",
        },
        select: { id: true, title: true, url: true },
      });
      created.push(record);
    } catch {
      // Skip duplicate URL conflicts (race condition protection)
    }
  }

  return created;
}
