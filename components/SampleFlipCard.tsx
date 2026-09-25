"use client";

import Link from "next/link";
import FlipCard from "./FlipCard";

/** The flip card captures the pointer on press and flips on keyboard clicks; the link must opt out of both. */
function stop(event: React.SyntheticEvent) {
  event.stopPropagation();
}

export function SampleFlipCard({
  front,
  firstName,
  href,
  height,
}: {
  front: React.ReactNode;
  firstName: string;
  href: string;
  height: number;
}) {
  return (
    <FlipCard
      front={front}
      back={
        <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-border bg-card px-6 text-center">
          <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Sample profile</p>
          <Link
            href={href}
            onPointerDown={stop}
            onKeyDown={stop}
            onClick={stop}
            className="mt-5 rounded-lg bg-primary px-5 py-3 font-medium text-white hover:bg-[#0086dd]"
          >
            See {firstName}&apos;s full profile
          </Link>
          <p className="mt-5 text-xs text-muted-foreground">Tap the card to flip back</p>
        </div>
      }
      axis="y"
      flipOnClick
      draggable
      tilt
      tiltMax={6}
      hoverScale={1.015}
      glare
      glareOpacity={0.06}
      width={448}
      height={height}
      radius={16}
      background="var(--card)"
      color="var(--foreground)"
      shadowOpacity={0.5}
      ariaLabel={`Sample profile for ${firstName}. Press to flip.`}
      className="align-top"
    />
  );
}
