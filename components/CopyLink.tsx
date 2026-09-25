"use client";

import { useState } from "react";

type Props = {
  url: string;
  variant?: "full" | "compact";
};

export function CopyLink({ url, variant = "full" }: Props) {
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

  if (variant === "compact") {
    return (
      <div>
        <button
          type="button"
          onClick={copy}
          className="btn-secondary px-3 py-1.5 text-sm"
        >
          {state === "copied" ? "Copied" : "Share"}
        </button>
        {state === "error" ? (
          <p className="mt-1 text-xs text-destructive">Clipboard blocked. Copy {url}</p>
        ) : null}
      </div>
    );
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
          className="btn-primary px-4 py-2 text-sm"
        >
          {state === "copied" ? "Copied" : "Share link"}
        </button>
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="btn-secondary px-4 py-2 text-sm"
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
