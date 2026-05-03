import type { Metadata } from "next";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Sources" };

export default async function SourcesPage() {
  const sources = await db.source.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-semibold mb-2">Sources</h1>
      <p className="text-sm mb-8" style={{ color: "var(--text-secondary)" }}>
        {sources.length} active sources tracked across company blogs and expert accounts.
      </p>
      {sources.length === 0 ? (
        <div
          className="rounded-lg border p-8 text-center"
          style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
        >
          No sources yet. Add sources in the admin dashboard.
        </div>
      ) : (
        <div className="grid gap-3">
          {sources.map((source) => (
            <div
              key={source.id}
              className="rounded-lg border p-4 flex items-center justify-between"
              style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-surface)" }}
            >
              <div>
                <span className="font-medium text-sm">{source.name}</span>
                {source.category && (
                  <span
                    className="ml-2 text-xs px-2 py-0.5 rounded-full"
                    style={{
                      backgroundColor: "var(--green-glow)",
                      color: "var(--green-dark)",
                    }}
                  >
                    {source.category}
                  </span>
                )}
              </div>
              {source.url && (
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs hover:underline"
                  style={{ color: "var(--text-muted)" }}
                >
                  ↗
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
