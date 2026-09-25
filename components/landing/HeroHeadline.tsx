"use client";

import { useEffect, useState } from "react";

const WORDS = [
  { lang: "en", text: "Your" },
  { lang: "hi", text: "आपका" },
  { lang: "mr", text: "तुमचा" },
  { lang: "kn", text: "ನಿಮ್ಮ" },
  { lang: "ta", text: "உங்கள்" },
  { lang: "ml", text: "നിങ്ങളുടെ" },
  { lang: "te", text: "మీ" },
];

const HOLD_MS = 2400;
const EXIT_MS = 240;

/**
 * Rotate-words headline: only the first word changes. It sits on its own line because the
 * translations range from about half to three times the width of "Your"; inline, they would
 * re-wrap the static text on every swap.
 */
export function HeroHeadline() {
  const [index, setIndex] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let swap: number | undefined;
    const id = window.setInterval(() => {
      setStarted(true);
      setLeaving(true);
      swap = window.setTimeout(() => {
        setIndex((i) => (i + 1) % WORDS.length);
        setLeaving(false);
      }, EXIT_MS);
    }, HOLD_MS + EXIT_MS);
    return () => {
      window.clearInterval(id);
      window.clearTimeout(swap);
    };
  }, []);

  const word = WORDS[index];

  return (
    <h1 className="max-w-xl font-display text-4xl font-semibold leading-tight text-foreground sm:text-6xl">
      {index === 0 ? null : <span className="sr-only">Your </span>}
      <span aria-hidden={index === 0 ? undefined : true} className="block whitespace-nowrap">
        <span
          key={word.lang}
          lang={word.lang}
          className={started ? (leaving ? "rotate-word-out" : "rotate-word-in") : "inline-block"}
        >
          {word.text}
        </span>
      </span>{" "}
      creator profile, always live and verified.
    </h1>
  );
}
