import { db } from "@/lib/db";
import { enrichContent } from "@/lib/ai";
import { computeScore } from "./scorer";

/**
 * Enrich a single content item: summarize, tag topics, score.
 * Updates the DB record from PENDING → ENRICHED (or leaves PENDING on error).
 */
export async function enrichItem(contentItemId: string): Promise<void> {
  const item = await db.contentItem.findUnique({
    where: { id: contentItemId },
    select: {
      id: true,
      title: true,
      rawText: true,
      publishedAt: true,
      status: true,
      source: { select: { authorityScore: true } },
    },
  });

  if (!item || item.status !== "PENDING") return;

  try {
    const result = await enrichContent(item.title, item.rawText ?? item.title);

    // Composite score: AI relevance + source authority + recency decay
    const score = computeScore({
      aiScore: result.score,
      authorityScore: item.source.authorityScore,
      publishedAt: item.publishedAt,
    });

    // Resolve topic IDs
    const topics = await db.topic.findMany({
      where: { slug: { in: result.topics } },
      select: { id: true, slug: true },
    });

    await db.contentItem.update({
      where: { id: contentItemId },
      data: {
        summary: result.summary,
        summaryZh: result.summaryZh,
        whyItMatters: result.whyItMatters,
        whyItMattersZh: result.whyItMattersZh,
        developerTakeaway: result.developerTakeaway,
        developerTakeawayZh: result.developerTakeawayZh,
        score,
        status: "ENRICHED",
        topics: {
          create: topics.map((t) => ({ topicId: t.id, confidence: 1.0 })),
        },
      },
    });
  } catch (error) {
    console.error(
      JSON.stringify({
        level: "error",
        msg: "enrichItem failed",
        contentItemId,
        error: error instanceof Error ? error.message : String(error),
      })
    );
  }
}

/**
 * Publish all ENRICHED items with score >= threshold.
 */
export async function publishEnrichedItems(minScore = 0.3): Promise<number> {
  const result = await db.contentItem.updateMany({
    where: { status: "ENRICHED", score: { gte: minScore } },
    data: { status: "PUBLISHED" },
  });
  return result.count;
}
