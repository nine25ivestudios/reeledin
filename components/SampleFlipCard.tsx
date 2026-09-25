"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import FlipCard from "./FlipCard";

const TOUCH_QUERY = "(hover: none) and (pointer: coarse)";

/** The flip card captures the pointer on press and flips on keyboard clicks; the link must opt out of both. */
function stop(event: React.SyntheticEvent) {
  event.stopPropagation();
}

function useIsTouch() {
  const [touch, setTouch] = useState(false);
  useEffect(() => {
    const query = window.matchMedia(TOUCH_QUERY);
    const update = () => setTouch(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  return touch;
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
  const touch = useIsTouch();

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
            className="btn-primary mt-5 px-5 py-3"
          >
            See {firstName}&apos;s full profile
          </Link>
          <p className="mt-5 text-xs text-muted-foreground">Tap the card to flip back</p>
        </div>
      }
      axis="y"
      flipOnClick
      simple={touch}
      flipDuration={450}
      draggable={!touch}
      tilt={!touch}
      tiltMax={6}
      hoverScale={touch ? 1 : 1.015}
      glare={!touch}
      glareOpacity={0.06}
      shadow={!touch}
      width={448}
      height={height}
      radius={16}
      background="var(--card)"
      color="var(--foreground)"
      shadowOpacity={0.5}
      ariaLabel={`Sample profile for ${firstName}. Press to flip.`}
      className="sample-flip align-top"
    />
  );
}
