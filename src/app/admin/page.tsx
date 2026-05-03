export const dynamic = "force-dynamic";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AdminPage() {
  const { userId } = await auth();
  if (!userId) redirect("/admin/sign-in");

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Admin Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { href: "/admin/sources", label: "Sources", desc: "Manage RSS feeds and X accounts" },
          { href: "/admin/content", label: "Content", desc: "Review and approve enriched content" },
          { href: "/admin/newsletter", label: "Newsletter", desc: "Manage campaigns and subscribers" },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-lg border p-5 hover:shadow-sm transition-shadow"
            style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-surface)" }}
          >
            <div className="font-semibold mb-1">{item.label}</div>
            <div className="text-sm" style={{ color: "var(--text-muted)" }}>{item.desc}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
