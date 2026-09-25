"use client";

import { useEffect, useRef, useState } from "react";

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
  const img = useRef<HTMLImageElement>(null);

  // A load error before hydration never reaches onError; catch it here.
  useEffect(() => {
    const el = img.current;
    if (el && el.complete && el.naturalWidth === 0) setFailed(true);
  }, [src]);

  if (!src || failed) return <>{initials}</>;
  return (
    // Instagram CDN URLs expire; onError falls back to initials.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      ref={img}
      src={src}
      alt={alt ?? ""}
      className="h-full w-full object-cover"
      onError={() => setFailed(true)}
    />
  );
}
