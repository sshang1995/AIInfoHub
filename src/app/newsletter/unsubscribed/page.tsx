import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Unsubscribed — AIInfoHub" };

export default function UnsubscribedPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      <h1 className="text-3xl font-semibold mb-3" style={{ color: "var(--text-primary)" }}>
        You&apos;ve been unsubscribed
      </h1>
      <p className="text-base mb-8" style={{ color: "var(--text-secondary)" }}>
        You won&apos;t receive any more emails from AIInfoHub.
      </p>
      <Link
        href="/newsletter"
        className="text-sm underline"
        style={{ color: "var(--green)" }}
      >
        Changed your mind? Subscribe again
      </Link>
    </div>
  );
}
