"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function SyncButton({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const [state, setState] = useState<"idle" | "pending" | "success" | "error">("idle");
  const [message, setMessage] = useState<string>("");

  async function sync() {
    setState("pending");
    setMessage("");
    try {
      const res = await fetch("/api/sync", { method: "POST" });
      const body = (await res.json()) as { error?: string; ok?: boolean };
      if (!res.ok) {
        setState("error");
        setMessage(body.error ?? "Sync did not complete. Try Sync now again.");
        return;
      }
      setState("success");
      setMessage("Stats updated from Instagram.");
      router.refresh();
      window.setTimeout(() => setState("idle"), 2500);
    } catch {
      setState("error");
      setMessage("Could not reach Reeledin to sync. Check your connection and try Sync now again.");
    }
  }

  return (
    <div className={compact ? "flex flex-col items-end gap-1" : "flex flex-col gap-2"}>
      <button
        type="button"
        onClick={sync}
        disabled={state === "pending"}
        className="btn-secondary px-3 py-1.5 text-sm disabled:opacity-60"
      >
        {state === "pending" ? "Syncing…" : "Sync now"}
      </button>
      {state === "success" ? <p className="text-sm text-success">{message}</p> : null}
      {state === "error" ? <p className="text-sm text-destructive">{message}</p> : null}
    </div>
  );
}
