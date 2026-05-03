export const dynamic = "force-dynamic";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import type { Metadata } from "next";
import { ContentReviewCard } from "@/components/admin/ContentReviewCard";
import Link from "next/link";

export const metadata: Metadata = { title: "Content Review" };

const VALID_STATUSES = ["ALL", "PENDING", "ENRICHED", "PUBLISHED", "REJECTED"] as const;
type FilterStatus = (typeof VALID_STATUSES)[number];

interface Props {
  searchParams: Promise<{ status?: string; page?: string }>;
}

const PAGE_SIZE = 30;

export default async function AdminContentPage({ searchParams }: Props) {
  const { userId } = await auth();
  if (!userId) redirect("/admin/sign-in");

  const params = await searchParams;
  const rawStatus = params.status?.toUpperCase() ?? "ALL";
  const filterStatus: FilterStatus = VALID_STATUSES.includes(rawStatus as FilterStatus)
    ? (rawStatus as FilterStatus)
    : "ALL";
  const page = Math.max(1, parseInt(params.page ?? "1", 10));

  const where =
    filterStatus === "ALL" ? {} : { status: filterStatus as Exclude<FilterStatus, "ALL"> };

  const [items, total, pendingCount, enrichedCount] = await Promise.all([
    db.contentItem.findMany({
      where,
      orderBy: [{ status: "asc" }, { score: "desc" }, { createdAt: "desc" }],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { source: { select: { name: true } } },
    }),
    db.contentItem.count({ where }),
    db.contentItem.count({ where: { status: "PENDING" } }),
    db.contentItem.count({ where: { status: "ENRICHED" } }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold" style={{ color: "var(--text-primary)" }}>
          Content Review
        </h1>
        <span className="text-sm" style={{ color: "var(--text-muted)" }}>
          {total} items
        </span>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 mb-6 flex-wrap">
        {VALID_STATUSES.map((s) => {
          const badge = s === "PENDING" ? pendingCount : s === "ENRICHED" ? enrichedCount : null;
          const active = filterStatus === s;
          return (
            <Link
              key={s}
              href={`/admin/content?status=${s}`}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5"
              style={
                active
                  ? { backgroundColor: "var(--green)", color: "#fff" }
                  : { backgroundColor: "var(--bg-hover)", color: "var(--text-secondary)" }
              }
            >
              {s}
              {badge !== null && badge > 0 && (
                <span
                  className="text-xs px-1.5 rounded-full"
                  style={
                    active
                      ? { backgroundColor: "rgba(255,255,255,0.25)" }
                      : { backgroundColor: "var(--border)", color: "var(--text-muted)" }
                  }
                >
                  {badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {items.length === 0 ? (
        <div
          className="rounded-lg border p-10 text-center"
          style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
        >
          No {filterStatus === "ALL" ? "" : filterStatus.toLowerCase()} items.
          {filterStatus === "PENDING" && " Run ingestion to fetch new content."}
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <ContentReviewCard key={item.id} item={item} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center gap-3 mt-8 justify-center">
          {page > 1 && (
            <Link
              href={`/admin/content?status=${filterStatus}&page=${page - 1}`}
              className="text-sm px-4 py-2 rounded-lg border"
              style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}
            >
              ← Previous
            </Link>
          )}
          <span className="text-sm" style={{ color: "var(--text-muted)" }}>
            {page} / {totalPages}
          </span>
          {page < totalPages && (
            <Link
              href={`/admin/content?status=${filterStatus}&page=${page + 1}`}
              className="text-sm px-4 py-2 rounded-lg border"
              style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}
            >
              Next →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
