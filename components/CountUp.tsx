"use client";

import { useEffect, useState } from "react";
import { compactNumber, formatInteger, formatPercent } from "@/lib/format";

type Props = {
  value: number;
  kind: "integer" | "percent" | "compact";
};

function format(value: number, kind: Props["kind"]) {
  if (kind === "percent") return formatPercent(value);
  if (kind === "compact") return compactNumber(Math.round(value)).short;
  return formatInteger(Math.round(value));
}

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function CountUp({ value, kind }: Props) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (prefersReducedMotion()) {
      setDisplay(value);
      return;
    }

    const start = performance.now();
    const duration = 1400;
    let frame = 0;

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - (1 - t) ** 3;
      setDisplay(value * eased);
      if (t < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value]);

  return <span className="tabular-nums">{format(display, kind)}</span>;
}
