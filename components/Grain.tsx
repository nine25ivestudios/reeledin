export function Grain() {
  return (
    <svg
      className="pointer-events-none h-full w-full mix-blend-overlay"
      style={{ opacity: 0.035 }}
      aria-hidden="true"
    >
      <filter id="reeledin-grain" x="0" y="0" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="4" stitchTiles="stitch" />
      </filter>
      <rect width="100%" height="100%" filter="url(#reeledin-grain)" />
    </svg>
  );
}
