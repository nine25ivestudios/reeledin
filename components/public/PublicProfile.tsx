import { VerifiedCheck } from "@/components/BrandMark";
import { CopyLink } from "@/components/CopyLink";
import { FreshnessRing } from "@/components/FreshnessRing";
import { StatBar } from "@/components/Stat";
import { TrendSection } from "@/components/TrendSection";
import {
  AFTER_NEXT_SYNC,
  compactNumber,
  formatLastUpdated,
  formatPercent,
  initialsFrom,
  isLowSample,
} from "@/lib/format";
import type { PublicProfileView } from "@/lib/profile-view";
import { AudienceSection } from "./AudienceSection";
import { ContentSection } from "./ContentSection";
import { VerificationBand } from "./VerificationBand";

type HeadingLevel = "h1" | "h2" | "h3";

type Props = {
  profile: PublicProfileView;
  /** Null hides the Share button (the dashboard, while the link is private). */
  shareUrl: string | null;
  /** Null disables outbound Instagram links (used by the sample profile). */
  instagramUrl: string | null;
  /** Use a lower heading level when the profile is embedded inside another page. */
  nameAs?: HeadingLevel;
};

export function ProfileHeader({
  profile,
  shareUrl,
  nameAs = "h1",
  compact = false,
}: {
  profile: PublicProfileView;
  shareUrl: string | null;
  nameAs?: HeadingLevel;
  /** Smaller ring, and no bio on phones — for previews where the stats should stay in view. */
  compact?: boolean;
}) {
  const Name = nameAs;
  return (
    <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
      <div className={`flex flex-col md:flex-row md:items-start md:justify-between ${compact ? "gap-4" : "gap-5"}`}>
        <div className="flex min-w-0 items-start gap-4">
          <FreshnessRing
            initials={initialsFrom(profile.displayName || profile.username || "R")}
            lastSyncedAt={profile.lastSyncedAt}
            alt={profile.displayName}
            src={profile.profilePictureUrl}
            size={compact ? 72 : 96}
          />
          <div className="min-w-0 pt-1">
            <div className="flex flex-wrap items-center gap-2">
              <Name className="font-display text-2xl font-semibold italic tracking-tight text-foreground sm:text-3xl">
                {profile.displayName}
              </Name>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-2 py-0.5 text-xs font-medium text-verified">
                <VerifiedCheck className="h-3.5 w-3.5" />
                Verified
              </span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">@{profile.username}</p>
            {profile.bio ? (
              <p className={`mt-3 max-w-2xl text-sm text-foreground/90 ${compact ? "hidden sm:block" : ""}`}>
                {profile.bio}
              </p>
            ) : null}
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2 md:flex-col md:items-end">
          <span className="inline-flex items-center rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
            {formatLastUpdated(profile.lastSyncedAt)}
          </span>
          {shareUrl ? <CopyLink url={shareUrl} variant="compact" /> : null}
        </div>
      </div>
    </section>
  );
}

export function ProfileStats({ profile }: { profile: PublicProfileView }) {
  const lowSample = isLowSample(profile.postsAnalyzed);
  const followers = compactNumber(profile.followersCount);
  const reelViews = profile.avgReelViews === null ? null : compactNumber(Math.round(profile.avgReelViews));
  const reach = profile.reach === null ? null : compactNumber(profile.reach);

  return (
    <StatBar
      columnsClassName="lg:grid-cols-[1.35fr_1fr_1fr_1fr]"
      items={[
        {
          label: "Followers",
          value: followers.short,
          exact: followers.exact,
          featured: true,
          delta: profile.deltas.followers,
        },
        {
          label: "Engagement Rate",
          value: formatPercent(profile.engagementRate),
          muted: lowSample,
          tag: lowSample ? "Low sample size" : undefined,
          delta: profile.deltas.engagementRate,
        },
        {
          label: "Avg Reel Views",
          value: reelViews?.short ?? null,
          exact: reelViews?.exact,
          emptyCaption: AFTER_NEXT_SYNC,
          delta: profile.deltas.avgReelViews,
        },
        {
          label: "Monthly Reach",
          value: reach?.short ?? null,
          exact: reach?.exact,
          emptyCaption: AFTER_NEXT_SYNC,
          delta: profile.deltas.monthlyReach,
        },
      ]}
    />
  );
}

export function PublicProfile({ profile, shareUrl, instagramUrl, nameAs = "h1" }: Props) {
  return (
    <div className="space-y-6">
      <ProfileHeader profile={profile} shareUrl={shareUrl} nameAs={nameAs} />

      <ProfileStats profile={profile} />

      <TrendSection trends={profile.trends} currentReach={profile.reach} currentEngagement={profile.engagementRate} />

      <AudienceSection followersCount={profile.followersCount} audience={profile.audience} />

      <ContentSection posts={profile.recentPosts} />

      <div className="flex justify-center">
        {instagramUrl ? (
          <a href={instagramUrl} target="_blank" rel="noreferrer" className="btn-primary px-6 py-3 text-sm">
            Message on Instagram
          </a>
        ) : (
          <span
            aria-disabled="true"
            title="Disabled on the sample profile"
            className="btn-primary cursor-not-allowed px-6 py-3 text-sm opacity-60"
          >
            Message on Instagram
          </span>
        )}
      </div>

      <VerificationBand lastSyncedAt={profile.lastSyncedAt} />
    </div>
  );
}
