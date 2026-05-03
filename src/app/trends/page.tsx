export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import { TOPIC_COLORS, TOPICS } from "@/lib/constants";
import Link from "next/link";

export const metadata: Metadata = { title: "Trends — AIInfoHub" };

interface TopicTrend {
  slug: string;
  name: string;
  color: string;
  count7d: number;
  count30d: number;
  avgScore: number;
  topItemTitle: string | null;
}

export default async function TrendsPage() {
  const now = new Date();
  const since7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const since30d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [allTopics, totalPublished, published7d] = await Promise.all([
    db.topic.findMany({
      include: {
        contentTopics: {
          where: { contentItem: { status: "PUBLISHED" } },
          include: {
            contentItem: {
              select: { score: true, publishedAt: true, title: true },
            },
          },
        },
      },
    }),
    db.contentItem.count({ where: { status: "PUBLISHED" } }),
    db.contentItem.count({
      where: { status: "PUBLISHED", publishedAt: { gte: since7d } },
    }),
  ]);

  const trends: TopicTrend[] = allTopics
    .map((topic) => {
      const items = topic.contentTopics.map((ct) => ct.contentItem);
      const items7d = items.filter((i) => i.publishedAt && i.publishedAt >= since7d);
      const items30d = items.filter((i) => i.publishedAt && i.publishedAt >= since30d);
      const avgScore =
        items.length > 0 ? items.reduce((s, i) => s + i.score, 0) / items.length : 0;
      const topItem = items7d.sort((a, b) => b.score - a.score)[0] ?? null;

      return {
        slug: topic.slug,
        name: topic.name,
        color: TOPIC_COLORS[topic.slug] ?? "#15803D",
        count7d: items7d.length,
        count30d: items30d.length,
        avgScore,
        topItemTitle: topItem?.title ?? null,
      };
    })
    .filter((t) => t.count30d > 0)
    .sort((a, b) => b.count7d - a.count7d || b.avgScore - a.avgScore);

  const maxCount = trends[0]?.count7d ?? 1;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
        Trending in AI
      </h1>
      <p className="text-sm mb-8" style={{ color: "var(--text-secondary)" }}>
        Topics gaining momentum across company blogs and research labs.
      </p>

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
        {[
          { label: "Topics tracked", value: TOPICS.length },
          { label: "Published items", value: totalPublished },
          { label: "New this week", value: published7d },
          { label: "Active topics", value: trends.length },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="rounded-lg border p-4"
            style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-surface)" }}
          >
            <div className="text-2xl font-semibold" style={{ color: "var(--text-primary)" }}>
              {value}
            </div>
            <div className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
              {label}
            </div>
          </div>
        ))}
      </div>

      {trends.length === 0 ? (
        <div
          className="rounded-lg border p-10 text-center"
          style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
        >
          Trend data will appear after ingestion is live.
        </div>
      ) : (
        <div className="space-y-4">
          {trends.map((trend, rank) => {
            const barPct = Math.round((trend.count7d / maxCount) * 100);
            return (
              <Link
                key={trend.slug}
                href={`/topics/${trend.slug}`}
                className="block rounded-lg border p-5 hover:shadow-sm transition-shadow"
                style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-surface)" }}
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-center gap-3">
                    <span
                      className="text-sm font-mono w-6 text-right shrink-0"
                      style={{ color: "var(--text-muted)" }}
                    >
                      #{rank + 1}
                    </span>
                    <div>
                      <span className="font-semibold text-sm" style={{ color: trend.color }}>
                        {trend.name}
                      </span>
                      {trend.topItemTitle && (
                        <p
                          className="text-xs mt-0.5 line-clamp-1"
                          style={{ color: "var(--text-muted)" }}
                        >
                          {trend.topItemTitle}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
                      {trend.count7d}
                    </div>
                    <div className="text-xs" style={{ color: "var(--text-muted)" }}>
                      this week
                    </div>
                  </div>
                </div>

                <div
                  className="h-1.5 rounded-full overflow-hidden"
                  style={{ backgroundColor: "var(--bg-hover)" }}
                >
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${barPct}%`, backgroundColor: trend.color }}
                  />
                </div>

                <div className="flex gap-4 mt-2">
                  <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                    {trend.count30d} last 30 days
                  </span>
                  <span className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>
                    avg score {trend.avgScore.toFixed(2)}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
