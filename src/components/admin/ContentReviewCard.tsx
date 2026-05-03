"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

interface ContentReviewCardProps {
  item: {
    id: string;
    title: string;
    url: string;
    status: string;
    score: number;
    summary: string | null;
    summaryZh: string | null;
    developerTakeaway: string | null;
    developerTakeawayZh: string | null;
    publishedAt: Date | null;
    source: { name: string };
  };
}

type Action = "approve" | "reject" | "publish" | "unpublish";

const STATUS_STYLES: Record<string, { bg: string; color: string }> = {
  PENDING: { bg: "#FEF3C7", color: "#92400E" },
  ENRICHED: { bg: "#DBEAFE", color: "#1E40AF" },
  PUBLISHED: { bg: "#D1FAE5", color: "#065F46" },
  REJECTED: { bg: "#FEE2E2", color: "#991B1B" },
};

export function ContentReviewCard({ item }: ContentReviewCardProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");

  const [summary, setSummary] = useState(item.summary ?? "");
  const [summaryZh, setSummaryZh] = useState(item.summaryZh ?? "");
  const [takeaway, setTakeaway] = useState(item.developerTakeaway ?? "");
  const [takeawayZh, setTakeawayZh] = useState(item.developerTakeawayZh ?? "");
  const [score, setScore] = useState(item.score.toFixed(2));
  const [status, setStatus] = useState(item.status);

  const style = STATUS_STYLES[status] ?? STATUS_STYLES.PENDING;

  async function dispatch(action: Action) {
    setError("");
    const body: Record<string, unknown> = { action };
    if (editing) {
      body.summary = summary;
      body.summaryZh = summaryZh;
      body.developerTakeaway = takeaway;
      body.developerTakeawayZh = takeawayZh;
      body.score = parseFloat(score);
    }

    const res = await fetch(`/api/admin/content/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = (await res.json()) as { success: boolean; error?: string; item?: { status: string } };

    if (!res.ok || !data.success) {
      setError(data.error ?? "Update failed");
      return;
    }

    setStatus(data.item?.status ?? status);
    setEditing(false);
    startTransition(() => router.refresh());
  }

  return (
    <div
      className="rounded-lg border overflow-hidden"
      style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-surface)" }}
    >
      {/* Header row */}
      <div className="flex items-start gap-3 p-4">
        <div className="flex-1 min-w-0">
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-sm hover:underline line-clamp-2 block"
            style={{ color: "var(--text-primary)" }}
          >
            {item.title}
          </a>
          <div className="flex flex-wrap gap-3 mt-1.5">
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>
              {item.source.name}
            </span>
            <span className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>
              score: {parseFloat(score).toFixed(2)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span
            className="text-xs px-2 py-0.5 rounded-full font-medium"
            style={{ backgroundColor: style.bg, color: style.color }}
          >
            {status}
          </span>
          <button
            onClick={() => { setExpanded(!expanded); setEditing(false); }}
            className="text-xs px-2 py-1 rounded border transition-colors hover:opacity-80"
            style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}
          >
            {expanded ? "Collapse" : "Review"}
          </button>
        </div>
      </div>

      {/* Expanded review panel */}
      {expanded && (
        <div
          className="border-t px-4 py-4 space-y-4"
          style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-base)" }}
        >
          {editing ? (
            <div className="space-y-3">
              <Field label="Summary (EN)" value={summary} onChange={setSummary} rows={3} />
              <Field label="Summary (ZH)" value={summaryZh} onChange={setSummaryZh} rows={3} />
              <Field label="Developer Takeaway (EN)" value={takeaway} onChange={setTakeaway} rows={2} />
              <Field label="Developer Takeaway (ZH)" value={takeawayZh} onChange={setTakeawayZh} rows={2} />
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-muted)" }}>
                  Score (0–1)
                </label>
                <input
                  type="number"
                  min={0}
                  max={1}
                  step={0.01}
                  value={score}
                  onChange={(e) => setScore(e.target.value)}
                  className="w-28 rounded border px-2 py-1 text-sm font-mono"
                  style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-surface)" }}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-3 text-sm">
              {summary && (
                <div>
                  <p className="text-xs font-semibold mb-1" style={{ color: "var(--text-muted)" }}>
                    SUMMARY
                  </p>
                  <p style={{ color: "var(--text-primary)" }}>{summary}</p>
                </div>
              )}
              {takeaway && (
                <div
                  className="border-l-2 pl-3"
                  style={{ borderColor: "var(--green)" }}
                >
                  <p className="text-xs font-semibold mb-1" style={{ color: "var(--green)" }}>
                    DEVELOPER TAKEAWAY
                  </p>
                  <p style={{ color: "var(--text-secondary)" }}>{takeaway}</p>
                </div>
              )}
              {!summary && !takeaway && (
                <p className="text-xs italic" style={{ color: "var(--text-muted)" }}>
                  No enrichment yet — run ingestion to generate summaries.
                </p>
              )}
            </div>
          )}

          {error && (
            <p className="text-xs" style={{ color: "#DC2626" }}>
              {error}
            </p>
          )}

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              onClick={() => setEditing(!editing)}
              className="text-xs px-3 py-1.5 rounded border transition-colors"
              style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}
            >
              {editing ? "Cancel edit" : "Edit"}
            </button>

            {status !== "PUBLISHED" && status !== "REJECTED" && (
              <ActionButton
                label={editing ? "Save & Approve" : "Approve"}
                color="var(--green)"
                disabled={isPending}
                onClick={() => dispatch("approve")}
              />
            )}

            {status === "ENRICHED" && (
              <ActionButton
                label={editing ? "Save & Publish" : "Publish"}
                color="#2563EB"
                disabled={isPending}
                onClick={() => dispatch("publish")}
              />
            )}

            {status === "PUBLISHED" && (
              <ActionButton
                label="Unpublish"
                color="#CA8A04"
                disabled={isPending}
                onClick={() => dispatch("unpublish")}
              />
            )}

            {status !== "REJECTED" && (
              <ActionButton
                label="Reject"
                color="#DC2626"
                disabled={isPending}
                onClick={() => dispatch("reject")}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  rows,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows: number;
}) {
  return (
    <div>
      <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-muted)" }}>
        {label}
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        className="w-full rounded border px-2 py-1.5 text-sm resize-y"
        style={{
          borderColor: "var(--border)",
          backgroundColor: "var(--bg-surface)",
          color: "var(--text-primary)",
        }}
      />
    </div>
  );
}

function ActionButton({
  label,
  color,
  disabled,
  onClick,
}: {
  label: string;
  color: string;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="text-xs px-3 py-1.5 rounded font-medium text-white transition-opacity disabled:opacity-50"
      style={{ backgroundColor: color }}
    >
      {label}
    </button>
  );
}
