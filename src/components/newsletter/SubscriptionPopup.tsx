"use client";

import { useState, useEffect } from "react";

const SESSION_KEY = "subscription_popup_dismissed";

export function SubscriptionPopup() {
  const [visible, setVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (sessionStorage.getItem(SESSION_KEY)) return;
    const timer = setTimeout(() => setVisible(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  const dismiss = () => {
    sessionStorage.setItem(SESSION_KEY, "1");
    setVisible(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = (await res.json()) as { success: boolean; error?: string };

      if (data.success) {
        setStatus("success");
        sessionStorage.setItem(SESSION_KEY, "1");
        setTimeout(() => setVisible(false), 3500);
      } else {
        setStatus("error");
        setErrorMsg(data.error ?? "Failed to subscribe");
      }
    } catch {
      setStatus("error");
      setErrorMsg("Network error. Please try again.");
    }
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/25 backdrop-blur-[2px]"
        onClick={dismiss}
        aria-hidden
      />

      {/* Card */}
      <div
        className="relative w-full max-w-md rounded-xl border shadow-2xl p-6"
        style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border)" }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="popup-title"
      >
        <button
          onClick={dismiss}
          className="absolute top-3.5 right-3.5 w-7 h-7 flex items-center justify-center rounded-md transition-colors hover:bg-[var(--bg-hover)]"
          style={{ color: "var(--text-muted)" }}
          aria-label="Close"
        >
          ✕
        </button>

        {status === "success" ? (
          <div className="text-center py-4">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 text-xl"
              style={{ backgroundColor: "var(--green-light)", color: "var(--green)" }}
            >
              ✓
            </div>
            <h3
              className="text-lg font-semibold mb-1"
              style={{ fontFamily: "var(--font-spectral)", color: "var(--text-primary)" }}
            >
              Check your inbox
            </h3>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              We sent a confirmation link to <strong>{email}</strong>.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-5">
              <p
                className="text-xs font-mono uppercase tracking-widest mb-1"
                style={{ color: "var(--green)" }}
              >
                Daily Newsletter
              </p>
              <h3
                id="popup-title"
                className="text-xl font-semibold mb-1.5"
                style={{ fontFamily: "var(--font-spectral)", color: "var(--text-primary)" }}
              >
                Stay ahead of AI
              </h3>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                The most important AI updates for developers — curated and delivered daily.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={status === "loading"}
                className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none transition-all"
                style={{
                  borderColor: "var(--border)",
                  backgroundColor: "var(--bg-base)",
                  color: "var(--text-primary)",
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "var(--green)")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
              />

              {errorMsg && (
                <p className="text-xs" style={{ color: "#dc2626" }}>
                  {errorMsg}
                </p>
              )}

              <button
                type="submit"
                disabled={status === "loading"}
                className="w-full py-2.5 rounded-lg text-sm font-medium transition-opacity disabled:opacity-60"
                style={{ backgroundColor: "var(--green)", color: "#ffffff" }}
              >
                {status === "loading" ? "Subscribing…" : "Subscribe — it's free"}
              </button>

              <p className="text-xs text-center" style={{ color: "var(--text-muted)" }}>
                No spam. Unsubscribe anytime.
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
