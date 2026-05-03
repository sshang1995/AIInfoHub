import type { Metadata } from "next";

export const metadata: Metadata = { title: "About" };

export default function AboutPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-semibold mb-6">About AIInfoHub</h1>
      <div className="prose prose-sm space-y-4" style={{ color: "var(--text-secondary)" }}>
        <p>
          AIInfoHub is a curated AI trend and best-practice platform for developers.
          We aggregate updates from official AI company blogs and high-signal expert accounts,
          then use AI to extract the developer-relevant signal.
        </p>
        <p>
          Every item includes a plain-English summary, a &ldquo;why it matters&rdquo; for developers,
          and a concrete developer takeaway — so you know exactly what to do with each update.
        </p>
        <p>
          Content is available in English and 中文 (Simplified Chinese).
        </p>
      </div>
    </div>
  );
}
