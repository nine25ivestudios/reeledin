import { DEMO_HERO } from "@/lib/demo-data";
import { formatRelativeTime } from "@/lib/format";
import { roundToHour } from "@/lib/freshness";
import { VerifiedCheck } from "./BrandMark";
import { CountUp } from "./CountUp";
import { FreshnessRing } from "./FreshnessRing";

export function HeroCredential() {
  const lastSyncedAt = new Date(roundToHour(new Date()).getTime() - DEMO_HERO.syncedHoursAgo * 3_600_000);

  return (
    <div className="relative z-0 mx-auto w-full max-w-md overflow-visible lg:mx-0 lg:justify-self-end">
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 z-0 h-[560px] w-[560px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-20 blur-[100px]"
        style={{
          background:
            "conic-gradient(from 180deg, #405DE6, #5B51D8, #833AB4, #C13584, #E1306C, #FD1D1D, #F56040, #F77737, #FCAF45, #FFDC80, #405DE6)",
        }}
        aria-hidden="true"
      />
      <article className="relative z-10 rounded-2xl border border-border bg-card px-6 py-7">
        <p className="mb-5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          Sample credential
        </p>
        <div className="flex items-start gap-4">
          <FreshnessRing
            initials={DEMO_HERO.initials}
            lastSyncedAt={lastSyncedAt}
            size={88}
            alt={DEMO_HERO.displayName}
            pulse
          />
          <div className="min-w-0 pt-1">
            <p className="font-display text-xl font-semibold text-foreground">{DEMO_HERO.displayName}</p>
            <p className="text-sm text-muted-foreground">@{DEMO_HERO.handle}</p>
            <span className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-border px-2 py-0.5 text-xs font-medium text-verified">
              <VerifiedCheck className="h-3.5 w-3.5" />
              Verified
            </span>
          </div>
        </div>

        <dl className="mt-6 grid grid-cols-3 gap-2">
          <div className="rounded-xl bg-background px-2 py-3 text-center">
            <dt className="text-[10px] uppercase tracking-wide text-muted-foreground">Followers</dt>
            <dd className="mt-1 font-display text-lg font-semibold text-foreground sm:text-xl">
              <CountUp value={DEMO_HERO.followers} kind="integer" />
            </dd>
          </div>
          <div className="rounded-xl bg-background px-2 py-3 text-center">
            <dt className="text-[10px] uppercase tracking-wide text-muted-foreground">Engagement</dt>
            <dd className="mt-1 font-display text-lg font-semibold text-foreground sm:text-xl">
              <CountUp value={DEMO_HERO.engagement} kind="percent" />
            </dd>
          </div>
          <div className="rounded-xl bg-background px-2 py-3 text-center">
            <dt className="text-[10px] uppercase tracking-wide text-muted-foreground">Avg likes</dt>
            <dd className="mt-1 font-display text-lg font-semibold text-foreground sm:text-xl">
              <CountUp value={DEMO_HERO.avgLikes} kind="integer" />
            </dd>
          </div>
        </dl>

        <p className="mt-5 text-sm text-muted-foreground">{formatRelativeTime(lastSyncedAt)}</p>
      </article>
    </div>
  );
}
