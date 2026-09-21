"use client";

import { useState } from "react";

type Props = {
  url: string;
};

export function CopyLink({ url }: Props) {
  const [state, setState] = useState<"idle" | "copied" | "error">("idle");

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setState("copied");
      window.setTimeout(() => setState("idle"), 2000);
    } catch {
      setState("error");
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <code className="block truncate rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground">
        {url}
      </code>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={copy}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-[#0086dd]"
        >
          {state === "copied" ? "Copied" : "Share link"}
        </button>
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:border-primary"
        >
          Open link
        </a>
      </div>
      {state === "error" ? (
        <p className="text-sm text-destructive">Clipboard is blocked. Copy the URL above manually.</p>
      ) : null}
    </div>
  );
}
