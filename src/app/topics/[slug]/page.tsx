export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { TOPICS, TOPIC_COLORS } from "@/lib/constants";
import { ContentCard } from "@/components/content/ContentCard";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}

const PAGE_SIZE = 20;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const topic = TOPICS.find((t) => t.slug === slug);
  if (!topic) return {};
  return { title: `${topic.name} — AIInfoHub` };
}

export default async function TopicPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { page: pageParam } = await searchParams;
  const topic = TOPICS.find((t) => t.slug === slug);
  if (!topic) notFound();

  const page = Math.max(1, parseInt(pageParam ?? "1", 10));
  const skip = (page - 1) * PAGE_SIZE;
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const where = {
    status: "PUBLISHED" as const,
    publishedAt: { gte: sevenDaysAgo },
    topics: { some: { topic: { slug } } },
  };

  const [items, total] = await Promise.all([
    db.contentItem.findMany({
      where,
      orderBy: [{ score: "desc" }, { publishedAt: "desc" }],
      skip,
      take: PAGE_SIZE,
      include: {
        source: { select: { name: true } },
        topics: {
          include: { topic: { select: { slug: true, name: true, nameZh: true } } },
          orderBy: { confidence: "desc" },
          take: 3,
        },
      },
    }),
    db.contentItem.count({ where }),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const color = TOPIC_COLORS[slug] ?? "var(--green)";

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold mb-1" style={{ color }}>
          {topic.name}
        </h1>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          {topic.nameZh} — {total} published in the last 7 days
        </p>
      </div>

      {items.length === 0 ? (
        <div
          className="rounded-lg border p-12 text-center"
          style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
        >
          <p className="font-medium mb-2">No content yet</p>
          <p className="text-sm">
            Nothing published for this topic in the last 7 days.
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-4">
            {items.map((item) => (
              <ContentCard
                key={item.id}
                id={item.id}
                title={item.title}
                url={item.url}
                summary={item.summary}
                summaryZh={item.summaryZh}
                whyItMatters={item.whyItMatters}
                whyItMattersZh={item.whyItMattersZh}
                developerTakeaway={item.developerTakeaway}
                developerTakeawayZh={item.developerTakeawayZh}
                publishedAt={item.publishedAt}
                score={item.score}
                sourceName={item.source.name}
                topics={item.topics.map((ct) => ct.topic)}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              {page > 1 && (
                <Link
                  href={`/topics/${slug}?page=${page - 1}`}
                  className="px-4 py-2 rounded-lg border text-sm transition-colors hover:bg-[var(--bg-hover)]"
                  style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}
                >
                  ← Previous
                </Link>
              )}
              <span className="text-sm font-mono px-3" style={{ color: "var(--text-muted)" }}>
                {page} / {totalPages}
              </span>
              {page < totalPages && (
                <Link
                  href={`/topics/${slug}?page=${page + 1}`}
                  className="px-4 py-2 rounded-lg border text-sm transition-colors hover:bg-[var(--bg-hover)]"
                  style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}
                >
                  Next →
                </Link>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
