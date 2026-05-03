export const dynamic = "force-dynamic";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import type { Metadata } from "next";
import { SendDigestButton } from "@/components/admin/SendDigestButton";

export const metadata: Metadata = { title: "Newsletter" };

const CAMPAIGN_STATUS_STYLES: Record<string, { bg: string; color: string }> = {
  SENT: { bg: "#D1FAE5", color: "#065F46" },
  SENDING: { bg: "#DBEAFE", color: "#1E40AF" },
  FAILED: { bg: "#FEE2E2", color: "#991B1B" },
  DRAFT: { bg: "#F3F4F6", color: "#6B7280" },
};

export default async function AdminNewsletterPage() {
  const { userId } = await auth();
  if (!userId) redirect("/admin/sign-in");

  const [activeCount, pendingCount, unsubCount, campaigns, recentSubscribers] =
    await Promise.all([
      db.subscriber.count({ where: { status: "ACTIVE" } }),
      db.subscriber.count({ where: { status: "PENDING" } }),
      db.subscriber.count({ where: { status: "UNSUBSCRIBED" } }),
      db.newsletterCampaign.findMany({
        orderBy: { createdAt: "desc" },
        take: 10,
        include: { _count: { select: { deliveries: true } } },
      }),
      db.subscriber.findMany({
        orderBy: { createdAt: "desc" },
        take: 20,
        select: { email: true, status: true, confirmedAt: true, createdAt: true },
      }),
    ]);

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4">
        <h1 className="text-2xl font-semibold" style={{ color: "var(--text-primary)" }}>
          Newsletter
        </h1>
        <SendDigestButton />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Active subscribers", value: activeCount, accent: true },
          { label: "Pending confirmation", value: pendingCount, accent: false },
          { label: "Unsubscribed", value: unsubCount, accent: false },
        ].map(({ label, value, accent }) => (
          <div
            key={label}
            className="rounded-lg border p-5"
            style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-surface)" }}
          >
            <div
              className="text-3xl font-semibold"
              style={{ color: accent ? "var(--green)" : "var(--text-primary)" }}
            >
              {value}
            </div>
            <div className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
              {label}
            </div>
          </div>
        ))}
      </div>

      {/* Campaign history */}
      <section>
        <h2 className="text-base font-semibold mb-3" style={{ color: "var(--text-primary)" }}>
          Campaign history
        </h2>
        {campaigns.length === 0 ? (
          <div
            className="rounded-lg border p-8 text-center text-sm"
            style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
          >
            No campaigns sent yet. Click &ldquo;Send digest now&rdquo; to send the first one.
          </div>
        ) : (
          <div className="space-y-2">
            {campaigns.map((c) => {
              const style = CAMPAIGN_STATUS_STYLES[c.status] ?? CAMPAIGN_STATUS_STYLES.DRAFT;
              return (
                <div
                  key={c.id}
                  className="rounded-lg border p-4 flex items-center justify-between gap-4"
                  style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-surface)" }}
                >
                  <div className="flex-1 min-w-0">
                    <div
                      className="font-medium text-sm truncate"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {c.subject}
                    </div>
                    <div className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                      {c.sendDate.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                      {" · "}
                      {c._count.deliveries} recipient{c._count.deliveries !== 1 ? "s" : ""}
                    </div>
                  </div>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full font-medium shrink-0"
                    style={{ backgroundColor: style.bg, color: style.color }}
                  >
                    {c.status}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Recent subscribers */}
      <section>
        <h2 className="text-base font-semibold mb-3" style={{ color: "var(--text-primary)" }}>
          Recent subscribers
        </h2>
        {recentSubscribers.length === 0 ? (
          <div
            className="rounded-lg border p-8 text-center text-sm"
            style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
          >
            No subscribers yet.
          </div>
        ) : (
          <div className="rounded-lg border overflow-hidden" style={{ borderColor: "var(--border)" }}>
            {recentSubscribers.map((s, i) => (
              <div
                key={s.email}
                className="flex items-center justify-between px-4 py-2.5"
                style={{
                  borderTop: i === 0 ? "none" : "1px solid var(--border)",
                  backgroundColor: "var(--bg-surface)",
                }}
              >
                <span
                  className="font-mono text-xs truncate flex-1"
                  style={{ color: "var(--text-primary)" }}
                >
                  {s.email}
                </span>
                <div className="flex items-center gap-3 shrink-0 ml-4">
                  <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                    {s.createdAt.toLocaleDateString()}
                  </span>
                  <span
                    className="text-xs px-1.5 py-0.5 rounded"
                    style={
                      s.status === "ACTIVE"
                        ? { backgroundColor: "#D1FAE5", color: "#065F46" }
                        : s.status === "UNSUBSCRIBED"
                        ? { backgroundColor: "#FEE2E2", color: "#991B1B" }
                        : { backgroundColor: "#FEF3C7", color: "#92400E" }
                    }
                  >
                    {s.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
