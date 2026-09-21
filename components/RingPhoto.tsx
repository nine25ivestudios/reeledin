"use client";

import { useState } from "react";

export function RingPhoto({
  src,
  initials,
  alt,
}: {
  src?: string | null;
  initials: string;
  alt?: string;
}) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) return <>{initials}</>;
  return (
    // Instagram CDN URLs expire; onError falls back to initials.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt ?? ""}
      className="h-full w-full object-cover"
      onError={() => setFailed(true)}
    />
  );
}
