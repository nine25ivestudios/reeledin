import { RingPhoto } from "./RingPhoto";
import { formatRelativeTime } from "@/lib/format";
import { freshnessVars } from "@/lib/freshness";

type Props = {
  initials: string;
  lastSyncedAt: Date | string | null | undefined;
  size?: number;
  alt?: string;
  pulse?: boolean;
  src?: string | null;
};

export function FreshnessRing({ initials, lastSyncedAt, size = 88, alt, pulse = true, src }: Props) {
  const { sweep, fade } = freshnessVars(lastSyncedAt);
  const label = formatRelativeTime(lastSyncedAt);
  const pad = sweep <= 0 ? 1 : 3;
  const inner = size - pad * 2;
  const gray = `${Math.round((1 - fade) * 100)}%`;
  const live = pulse && sweep > 0;

  return (
    <div
      className="relative inline-flex shrink-0 items-center justify-center"
      style={{ width: size, height: size }}
      title={label}
      aria-label={alt ? `${alt}. ${label}` : label}
    >
      <div
        className={`absolute inset-0 rounded-full ${live ? "freshness-pulse" : ""}`}
        style={{
          ["--sweep" as string]: String(sweep),
          ["--fade" as string]: String(fade),
          ["--gray" as string]: gray,
          padding: pad,
          background:
            sweep <= 0
              ? "var(--border)"
              : "conic-gradient(from -90deg, #405DE6, #5B51D8, #833AB4, #C13584, #E1306C, #FD1D1D, #F56040, #F77737, #FCAF45, #FFDC80 calc(var(--sweep) * 360deg), #262626 0)",
          filter: sweep <= 0 ? undefined : `grayscale(${gray}) saturate(1) brightness(1)`,
        }}
      >
        <div className="h-full w-full rounded-full bg-background" />
      </div>
      <div
        className="relative z-[1] overflow-hidden rounded-full bg-card text-center font-display font-semibold text-foreground"
        style={{
          width: inner,
          height: inner,
          fontSize: inner * 0.28,
          lineHeight: `${inner}px`,
        }}
      >
        {src ? <RingPhoto src={src} initials={initials} alt={alt} /> : initials}
      </div>
    </div>
  );
}
