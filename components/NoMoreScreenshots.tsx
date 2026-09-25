"use client";

import { useEffect, useState } from "react";

const LINES = [
  { lang: "en", text: "No more screenshots." },
  { lang: "hi", text: "अब और स्क्रीनशॉट नहीं।" },
  { lang: "es", text: "Se acabaron las capturas." },
  { lang: "pt", text: "Chega de prints." },
  { lang: "fr", text: "Fini les captures d’écran." },
  { lang: "de", text: "Keine Screenshots mehr." },
];

const INTERVAL_MS = 2600;

export function NoMoreScreenshots() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % LINES.length), INTERVAL_MS);
    return () => window.clearInterval(id);
  }, []);

  const line = LINES[index];

  return (
    <p className="text-sm font-medium text-verified">
      <span className="sr-only">No more screenshots.</span>
      <span key={line.lang} lang={line.lang} aria-hidden="true" className="rotating-line inline-block">
        {line.text}
      </span>
    </p>
  );
}
