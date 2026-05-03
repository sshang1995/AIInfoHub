"use client";

import Link from "next/link";
import { TOPIC_COLORS } from "@/lib/constants";
import { timeAgo, truncate } from "@/lib/utils";
import { useLang } from "@/components/layout/LangProvider";

interface Topic {
  slug: string;
  name: string;
  nameZh: string | null;
}

interface ContentCardProps {
  id: string;
  title: string;
  url: string;
  summary: string | null;
  whyItMatters: string | null;
  developerTakeaway: string | null;
  publishedAt: Date | null;
  score: number;
  sourceName: string;
  topics: Topic[];
  summaryZh?: string | null;
  whyItMattersZh?: string | null;
  developerTakeawayZh?: string | null;
}

export function ContentCard({
  title,
  url,
  summary,
  summaryZh,
  whyItMatters,
  whyItMattersZh,
  developerTakeaway,
  developerTakeawayZh,
  publishedAt,
  sourceName,
  topics,
}: ContentCardProps) {
  const { lang } = useLang();
  const primaryTopic = topics[0];
  const topicColor = primaryTopic ? (TOPIC_COLORS[primaryTopic.slug] ?? "var(--green)") : "var(--green)";

  const displaySummary = lang === "zh" ? (summaryZh ?? summary) : summary;
  const displayWhyItMatters = lang === "zh" ? (whyItMattersZh ?? whyItMatters) : whyItMatters;
  const displayTakeaway = lang === "zh" ? (developerTakeawayZh ?? developerTakeaway) : developerTakeaway;

  return (
    <article
      className="rounded-lg border topic-border bg-[var(--bg-surface)] hover:shadow-sm transition-shadow"
      style={{
        borderColor: "var(--border)",
        "--topic-color": topicColor,
      } as React.CSSProperties}
    >
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-base hover:text-[var(--green)] transition-colors leading-snug"
              style={{ color: "var(--text-primary)", fontFamily: "var(--font-spectral)" }}
            >
              {title}
            </a>
          </div>
          <div className="text-xs shrink-0 font-mono mt-0.5" style={{ color: "var(--text-muted)" }}>
            {publishedAt ? timeAgo(publishedAt) : ""}
          </div>
        </div>

        {/* Meta: source + topics */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
            {sourceName}
          </span>
          {topics.map((t) => (
            <Link
              key={t.slug}
              href={`/topics/${t.slug}`}
              className="text-xs px-2 py-0.5 rounded-full transition-colors hover:opacity-80"
              style={{
                backgroundColor: `${TOPIC_COLORS[t.slug] ?? "var(--green)"}18`,
                color: TOPIC_COLORS[t.slug] ?? "var(--green)",
              }}
            >
              {lang === "zh" && t.nameZh ? t.nameZh : t.name}
            </Link>
          ))}
        </div>

        {/* Summary */}
        {displaySummary && (
          <p className="text-sm mb-3 leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            {truncate(displaySummary, 280)}
          </p>
        )}

        {/* Why it matters */}
        {displayWhyItMatters && (
          <p className="text-xs mb-3 italic" style={{ color: "var(--text-muted)" }}>
            {lang === "en" ? "Why it matters: " : "为何重要："}{displayWhyItMatters}
          </p>
        )}

        {/* Developer Takeaway */}
        {displayTakeaway && (
          <div className="developer-takeaway mt-3">
            <p className="text-xs font-semibold mb-1" style={{ color: "var(--green-dark)" }}>
              {lang === "en" ? "Developer Takeaway" : "开发者建议"}
            </p>
            <p className="text-sm" style={{ color: "var(--text-primary)" }}>
              {displayTakeaway}
            </p>
          </div>
        )}
      </div>
    </article>
  );
}
