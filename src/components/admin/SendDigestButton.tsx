"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface SendResult {
  success: boolean;
  campaignId?: string;
  totalSent?: number;
  totalFailed?: number;
  reason?: string;
  error?: string;
}

export function SendDigestButton() {
  const router = useRouter();
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [result, setResult] = useState<SendResult | null>(null);

  async function handleSend() {
    if (!confirm("Send the daily AI digest to all active subscribers now?")) return;

    setState("sending");
    setResult(null);

    try {
      const res = await fetch("/api/admin/newsletter/send", { method: "POST" });
      const data = (await res.json()) as SendResult;
      setResult(data);
      setState(data.success ? "done" : "error");
      if (data.success) router.refresh();
    } catch {
      setResult({ success: false, error: "Network error" });
      setState("error");
    }
  }

  return (
    <div className="space-y-2">
      <button
        onClick={handleSend}
        disabled={state === "sending"}
        className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-opacity disabled:opacity-50"
        style={{ backgroundColor: "var(--green)" }}
      >
        {state === "sending" ? "Sending…" : "Send digest now"}
      </button>

      {result && (
        <p className="text-xs" style={{ color: state === "done" ? "var(--green)" : "#DC2626" }}>
          {state === "done"
            ? result.reason === "no_content"
              ? "No new content to send."
              : result.reason === "no_subscribers"
              ? "No active subscribers."
              : `Sent to ${result.totalSent} subscriber${result.totalSent === 1 ? "" : "s"}${result.totalFailed ? `, ${result.totalFailed} failed` : ""}.`
            : (result.error ?? "Send failed.")}
        </p>
      )}
    </div>
  );
}
