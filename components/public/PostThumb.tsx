"use client";

import { useState } from "react";

export function PlayPlaceholder({ label }: { label?: string }) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-background">
      <span className="flex h-14 w-14 items-center justify-center rounded-full border border-border text-muted-foreground">
        <svg viewBox="0 0 16 16" className="ml-0.5 h-5 w-5" fill="currentColor" aria-hidden="true">
          <path d="M5 3.5v9l8-4.5-8-4.5Z" />
        </svg>
      </span>
      {label ? <span className="text-xs text-muted-foreground">{label}</span> : null}
    </div>
  );
}

export function PostThumb({ src }: { src: string | null }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) return <PlayPlaceholder />;
  return (
    // Instagram CDN URLs expire between syncs; fall back instead of showing a broken image.
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt="" className="h-full w-full object-cover" onError={() => setFailed(true)} />
  );
}
