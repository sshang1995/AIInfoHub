"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function NewsletterForm() {
  const searchParams = useSearchParams();
  const errorParam = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (errorParam === "invalid_token") setErrorMsg("That confirmation link is invalid or expired.");
    else if (errorParam === "server_error") setErrorMsg("Something went wrong. Please try again.");
  }, [errorParam]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = (await res.json()) as { success: boolean; error?: string };

      if (!res.ok || !data.success) {
        setErrorMsg(data.error === "Already subscribed" ? "You're already subscribed!" : (data.error ?? "Something went wrong."));
        setState("error");
        return;
      }

      setState("success");
    } catch {
      setErrorMsg("Network error. Please try again.");
      setState("error");
    }
  }

  if (state === "success") {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-6"
          style={{ backgroundColor: "var(--green-glow)" }}
        >
          <span className="text-2xl">✓</span>
        </div>
        <h1 className="text-3xl font-semibold mb-3" style={{ color: "var(--text-primary)" }}>
          Check your inbox
        </h1>
        <p className="text-base" style={{ color: "var(--text-secondary)" }}>
          We sent a confirmation link to <strong>{email}</strong>.
          Click it to activate your subscription.
        </p>
        <p className="text-sm mt-4" style={{ color: "var(--text-muted)" }}>
          Didn&apos;t get it? Check your spam folder or{" "}
          <button
            onClick={() => setState("idle")}
            className="underline"
            style={{ color: "var(--green)" }}
          >
            try again
          </button>
          .
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      <h1 className="text-4xl font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
        Daily AI Digest
      </h1>
      <p className="text-lg mb-2" style={{ color: "var(--text-secondary)" }}>
        The most important AI updates for developers, delivered every morning.
      </p>
      <p className="text-base mb-10" style={{ color: "var(--text-muted)" }}>
        Summaries, developer takeaways, and emerging trends — no noise.
      </p>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
      >
        <input
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1 rounded-lg border px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--green)]"
          style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-surface)" }}
          required
          disabled={state === "loading"}
        />
        <button
          type="submit"
          disabled={state === "loading"}
          className="px-6 py-2.5 rounded-lg text-sm font-medium text-white transition-opacity disabled:opacity-60"
          style={{ backgroundColor: "var(--green)" }}
        >
          {state === "loading" ? "Sending…" : "Subscribe"}
        </button>
      </form>

      {errorMsg && (
        <p className="text-sm mt-3" style={{ color: "#DC2626" }}>
          {errorMsg}
        </p>
      )}

      <p className="text-xs mt-4" style={{ color: "var(--text-muted)" }}>
        No spam. Unsubscribe anytime. Confirm via email.
      </p>
    </div>
  );
}

export default function NewsletterPage() {
  return (
    <Suspense>
      <NewsletterForm />
    </Suspense>
  );
}
