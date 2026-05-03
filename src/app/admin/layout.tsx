import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";

export const metadata: Metadata = { title: { default: "Admin", template: "%s | Admin — AIInfoHub" } };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <div className="min-h-screen" style={{ backgroundColor: "var(--bg-base)" }}>
        <div className="border-b px-4 py-3 flex items-center gap-3" style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-surface)" }}>
          <span className="font-semibold text-sm" style={{ color: "var(--green)" }}>
            AIInfoHub Admin
          </span>
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>Dashboard</span>
        </div>
        <div className="max-w-6xl mx-auto px-4 py-8">{children}</div>
      </div>
    </ClerkProvider>
  );
}
