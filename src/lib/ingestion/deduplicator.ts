import { db } from "@/lib/db";
import type { RssItem } from "./rss-fetcher";

export interface NewItem {
  item: RssItem;
  isNew: boolean;
}

/**
 * Filter out items already stored by URL.
 * Returns only truly new items.
 */
export async function deduplicateItems(items: RssItem[]): Promise<RssItem[]> {
  if (items.length === 0) return [];

  const urls = items.map((i) => i.url);
  const existing = await db.contentItem.findMany({
    where: { url: { in: urls } },
    select: { url: true },
  });

  const existingUrls = new Set(existing.map((e) => e.url));
  return items.filter((item) => !existingUrls.has(item.url));
}
