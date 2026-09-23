import type { ReactNode } from "react";
import { AudienceBreakdown } from "@/components/AudienceBreakdown";
import { VerifiedCheck } from "@/components/BrandMark";
import { CopyLink } from "@/components/CopyLink";
import { FreshnessRing } from "@/components/FreshnessRing";
import { RecentPostsGrid } from "@/components/RecentPostsGrid";
import { StatBar } from "@/components/Stat";
import { TrendSection } from "@/components/TrendSection";
import type { AudienceView, CredentialDeltas, TrendPoint } from "@/lib/data";
import {
  AFTER_NEXT_SYNC,
  formatInteger,
  formatLastUpdated,
  formatPercent,
  isLowSample,
} from "@/lib/format";
import type { RecentPost } from "@/lib/instagram";

export type CredentialModel = {
  displayName: string;
  username: string;
  bio: string;
  initials: string;
  profilePictureUrl: string | null;
  lastSyncedAt: Date | null;
  shareUrl: string | null;
  followers: number;
  engagementRate: number;
  avgReelViews: number | null;
  monthlyReach: number | null;
  postsAnalyzed: number;
  deltas: CredentialDeltas;
  trend: TrendPoint[];
  audience: AudienceView | null;
  recentPosts: RecentPost[];
};

export function CredentialView({
  model,
  actions,
}: {
  model: CredentialModel;
  actions?: ReactNode;
}) {
  const lowSample = isLowSample(model.postsAnalyzed);

  return (
    <div className="space-y-6 pt-6">
      <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            <FreshnessRing
              initials={model.initials}
              lastSyncedAt={model.lastSyncedAt}
              alt={model.displayName}
              src={model.profilePictureUrl}
              size={96}
            />
            <div className="min-w-0 pt-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                  {model.displayName}
                </h1>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-2 py-0.5 text-xs font-medium text-verified">
                  <VerifiedCheck className="h-3.5 w-3.5" />
                  Verified
                </span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">@{model.username}</p>
              {model.bio ? <p className="mt-3 max-w-2xl text-sm text-foreground/90">{model.bio}</p> : null}
            </div>
          </div>
          <div className="flex shrink-0 flex-col items-start gap-3 lg:items-end">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-verified">
              <VerifiedCheck className="h-3.5 w-3.5" />
              Verified — {formatLastUpdated(model.lastSyncedAt)}
            </span>
            <div className="flex flex-wrap items-center gap-2">
              {model.shareUrl ? <CopyLink url={model.shareUrl} variant="compact" /> : null}
              {actions}
            </div>
          </div>
        </div>
      </section>

      <StatBar
        items={[
          { label: "Followers", value: formatInteger(model.followers), featured: true, delta: model.deltas.followers },
          {
            label: "Engagement Rate",
            value: formatPercent(model.engagementRate),
            muted: lowSample,
            tag: lowSample ? "Low sample size" : undefined,
            delta: model.deltas.engagementRate,
          },
          {
            label: "Avg Reel Views",
            value: model.avgReelViews === null ? null : formatInteger(Math.round(model.avgReelViews)),
            emptyCaption: AFTER_NEXT_SYNC,
            delta: model.deltas.avgReelViews,
          },
          {
            label: "Monthly Reach",
            value: model.monthlyReach === null ? null : formatInteger(model.monthlyReach),
            emptyCaption: AFTER_NEXT_SYNC,
            delta: model.deltas.monthlyReach,
          },
        ]}
      />

      <TrendSection
        history={model.trend}
        currentReach={model.monthlyReach}
        currentEngagement={model.engagementRate}
      />

      <AudienceBreakdown followersCount={model.followers} audience={model.audience} />

      <RecentPostsGrid posts={model.recentPosts} username={model.username} />

      <div className="flex justify-center pt-2 pb-4">
        <a
          href={`https://www.instagram.com/${model.username}/`}
          target="_blank"
          rel="noreferrer"
          className="rounded-lg bg-primary px-6 py-3 text-sm font-medium text-white hover:bg-[#0086dd]"
        >
          Message on Instagram
        </a>
      </div>
    </div>
  );
}

export function initialsFrom(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
