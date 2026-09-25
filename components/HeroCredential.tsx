import { getDemoProfile } from "@/lib/demo-data";
import { compactNumber, formatRelativeTime, initialsFrom } from "@/lib/format";
import { VerifiedCheck } from "./BrandMark";
import { CountUp } from "./CountUp";
import { FreshnessRing } from "./FreshnessRing";
import { SampleFlipCard } from "./SampleFlipCard";

/** FlipCard needs a fixed height; this matches the card's natural content height. */
const CARD_HEIGHT = 334;

export function HeroCredential() {
  const demo = getDemoProfile();
  const avgLikes =
    demo.recentPosts.length > 0
      ? demo.recentPosts.reduce((sum, p) => sum + p.likeCount, 0) / demo.recentPosts.length
      : 0;
  const followersExact = compactNumber(demo.followersCount).exact;

  const front = (
    <div className="h-full rounded-2xl border border-border bg-card px-6 py-7">
      <p className="mb-5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        Sample profile
      </p>
      <div className="flex items-start gap-4">
        <FreshnessRing
          initials={initialsFrom(demo.displayName)}
          lastSyncedAt={demo.lastSyncedAt}
          size={88}
          alt={demo.displayName}
          pulse
        />
        <div className="min-w-0 pt-1">
          <p className="font-display text-xl font-semibold text-foreground">{demo.displayName}</p>
          <p className="text-sm text-muted-foreground">@{demo.username}</p>
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
            <CountUp value={demo.followersCount} kind="compact" />
          </dd>
          {followersExact ? (
            <dd className="mt-0.5 text-[10px] tabular-nums text-muted-foreground">{followersExact}</dd>
          ) : null}
        </div>
        <div className="rounded-xl bg-background px-2 py-3 text-center">
          <dt className="text-[10px] uppercase tracking-wide text-muted-foreground">Engagement</dt>
          <dd className="mt-1 font-display text-lg font-semibold text-foreground sm:text-xl">
            <CountUp value={demo.engagementRate} kind="percent" />
          </dd>
        </div>
        <div className="rounded-xl bg-background px-2 py-3 text-center">
          <dt className="text-[10px] uppercase tracking-wide text-muted-foreground">Avg likes</dt>
          <dd className="mt-1 font-display text-lg font-semibold text-foreground sm:text-xl">
            <CountUp value={Math.round(avgLikes)} kind="integer" />
          </dd>
        </div>
      </dl>

      <div className="mt-5 flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">{formatRelativeTime(demo.lastSyncedAt)}</p>
        <span className="text-sm font-medium text-primary">See a sample profile</span>
      </div>
    </div>
  );

  return (
    <div className="relative z-0 mx-auto w-full max-w-md overflow-visible lg:mx-0 lg:justify-self-end">
      <div
        className="hero-glow pointer-events-none absolute left-1/2 top-1/2 z-0 h-[min(560px,100vw)] w-[min(560px,100vw)] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-20 blur-[100px]"
        style={{
          background:
            "conic-gradient(from 180deg, #405DE6, #5B51D8, #833AB4, #C13584, #E1306C, #FD1D1D, #F56040, #F77737, #FCAF45, #FFDC80, #405DE6)",
        }}
        aria-hidden="true"
      />
      <div className="relative z-10">
        <SampleFlipCard
          href="/demo"
          firstName={demo.displayName.split(" ")[0]}
          height={CARD_HEIGHT}
          front={front}
        />
      </div>
    </div>
  );
}
