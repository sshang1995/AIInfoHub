"use client";

import { useState } from "react";

export function TriggerIngestButton() {
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  async function handleClick() {
    setStatus("loading");
    try {
      const res = await fetch("/api/ingest/trigger", { method: "POST" });
      setStatus(res.ok ? "done" : "error");
    } catch {
      setStatus("error");
    }
  }

  const label =
    status === "loading" ? "running…" :
    status === "done"    ? "done! refresh page" :
    status === "error"   ? "failed — check logs" :
    "trigger an ingest";

  return (
    <button
      onClick={handleClick}
      disabled={status === "loading"}
      className="underline disabled:opacity-50"
      style={{ color: "var(--green)" }}
    >
      {label}
    </button>
  );
}
