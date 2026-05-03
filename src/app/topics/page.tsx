import type { Metadata } from "next";
import Link from "next/link";
import { TOPICS, TOPIC_COLORS } from "@/lib/constants";

export const metadata: Metadata = { title: "Topics" };

export default function TopicsPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-semibold mb-2">Topics</h1>
      <p className="text-sm mb-8" style={{ color: "var(--text-secondary)" }}>
        Browse AI content by category.
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {TOPICS.map((topic) => (
          <Link
            key={topic.slug}
            href={`/topics/${topic.slug}`}
            className="rounded-lg border p-4 hover:shadow-sm transition-shadow"
            style={{
              borderColor: "var(--border)",
              backgroundColor: "var(--bg-surface)",
              borderLeftWidth: "4px",
              borderLeftColor: TOPIC_COLORS[topic.slug] ?? "var(--green)",
            }}
          >
            <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
              {topic.name}
            </span>
            <span className="block text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
              {topic.nameZh}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
