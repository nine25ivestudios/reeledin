export function BrandMark({ size = 28 }: { size?: number }) {
  return (
    <span
      className="inline-flex items-center justify-center rounded-lg p-px"
      style={{
        width: size,
        height: size,
        background:
          "conic-gradient(from 180deg, #405DE6, #5B51D8, #833AB4, #C13584, #E1306C, #FD1D1D, #F56040, #F77737, #FCAF45, #FFDC80, #405DE6)",
      }}
      aria-hidden="true"
    >
      <span className="flex h-full w-full items-center justify-center rounded-[7px] bg-background font-display text-xs font-semibold text-foreground">
        R
      </span>
    </span>
  );
}

export function VerifiedCheck({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="8" cy="8" r="8" fill="var(--verified)" />
      <path
        d="M4.4 8.2 6.6 10.4 11.6 5.4"
        stroke="white"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
