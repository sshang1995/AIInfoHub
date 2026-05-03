export const dynamic = "force-dynamic";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Sources" };

export default async function AdminSourcesPage() {
  const { userId } = await auth();
  if (!userId) redirect("/admin/sign-in");

  const sources = await db.source.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Sources</h1>
        <span className="text-sm" style={{ color: "var(--text-muted)" }}>
          {sources.length} total
        </span>
      </div>
      <div className="rounded-lg border overflow-hidden" style={{ borderColor: "var(--border)" }}>
        <table className="w-full text-sm">
          <thead style={{ backgroundColor: "var(--bg-hover)" }}>
            <tr>
              <th className="text-left px-4 py-3 font-medium" style={{ color: "var(--text-secondary)" }}>Name</th>
              <th className="text-left px-4 py-3 font-medium" style={{ color: "var(--text-secondary)" }}>Type</th>
              <th className="text-left px-4 py-3 font-medium" style={{ color: "var(--text-secondary)" }}>Category</th>
              <th className="text-left px-4 py-3 font-medium" style={{ color: "var(--text-secondary)" }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {sources.map((source) => (
              <tr key={source.id} className="border-t" style={{ borderColor: "var(--border-light)" }}>
                <td className="px-4 py-3 font-medium">{source.name}</td>
                <td className="px-4 py-3" style={{ color: "var(--text-muted)" }}>{source.sourceType}</td>
                <td className="px-4 py-3" style={{ color: "var(--text-muted)" }}>{source.category ?? "—"}</td>
                <td className="px-4 py-3">
                  <span
                    className="text-xs px-2 py-0.5 rounded-full"
                    style={source.active
                      ? { backgroundColor: "var(--green-light)", color: "var(--green-dark)" }
                      : { backgroundColor: "var(--bg-hover)", color: "var(--text-muted)" }
                    }
                  >
                    {source.active ? "Active" : "Inactive"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
