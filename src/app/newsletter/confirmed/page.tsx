import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Subscription Confirmed — AIInfoHub" };

interface Props {
  searchParams: Promise<{ already?: string }>;
}

export default async function ConfirmedPage({ searchParams }: Props) {
  const { already } = await searchParams;

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl"
        style={{ backgroundColor: "var(--green-glow)" }}
      >
        ✓
      </div>
      <h1 className="text-3xl font-semibold mb-3" style={{ color: "var(--text-primary)" }}>
        {already ? "You're already subscribed" : "You're subscribed!"}
      </h1>
      <p className="text-base mb-8" style={{ color: "var(--text-secondary)" }}>
        {already
          ? "Your email is already confirmed. You'll keep receiving the daily digest."
          : "Your email is confirmed. You'll receive the AI digest every morning."}
      </p>
      <Link
        href="/"
        className="inline-block px-6 py-2.5 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-90"
        style={{ backgroundColor: "var(--green)" }}
      >
        Browse today&apos;s digest →
      </Link>
    </div>
  );
}
