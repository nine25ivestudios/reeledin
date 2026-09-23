import { notFound } from "next/navigation";
import { VerifiedCheck } from "@/components/BrandMark";
import { CopyLink } from "@/components/CopyLink";
import { initialsFrom } from "@/components/CredentialView";
import { FreshnessRing } from "@/components/FreshnessRing";
import { PageShell } from "@/components/PageShell";
import { AudienceSection } from "@/components/public/AudienceSection";
import { ContentSection } from "@/components/public/ContentSection";
import { VerificationBand } from "@/components/public/VerificationBand";
import { StatBar } from "@/components/Stat";
import { TrendSection } from "@/components/TrendSection";
import { getPublicCredential } from "@/lib/data";
import { getAppUrl } from "@/lib/env";
import {
  AFTER_NEXT_SYNC,
  formatInteger,
  formatLastUpdated,
  formatPercent,
  isLowSample,
} from "@/lib/format";

export const dynamic = "force-dynamic";

type Props = { params: { handle: string } };

export async function generateMetadata({ params }: Props) {
  return {
    title: `@${params.handle} — Reeledin`,
    description: "Verified Instagram stats. Not self-reported.",
  };
}

export default async function PublicProfilePage({ params }: Props) {
  const data = await getPublicCredential(params.handle);
  if (!data) notFound();

  const { profile, account, snapshot, audience, recentPosts, deltas, trend, avgReelViews } = data;
  const shareUrl = `${getAppUrl()}/${profile.slug}`;
  const lowSample = isLowSample(snapshot.postsAnalyzed);

  return (
    <PageShell showConnect={false} width="wide" headerNote={shareUrl.replace(/^https?:\/\//, "")}>
      <div className="space-y-6 pt-6">
        <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
          <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
            <div className="flex min-w-0 items-start gap-4">
              <FreshnessRing
                initials={initialsFrom(profile.displayName || account.username || "R")}
                lastSyncedAt={account.lastSyncedAt}
                alt={profile.displayName}
                src={account.profilePictureUrl}
                size={96}
              />
              <div className="min-w-0 pt-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="font-display text-2xl font-semibold italic tracking-tight text-foreground sm:text-3xl">
                    {profile.displayName}
                  </h1>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-2 py-0.5 text-xs font-medium text-verified">
                    <VerifiedCheck className="h-3.5 w-3.5" />
                    Verified
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">@{account.username}</p>
                {profile.bio ? <p className="mt-3 max-w-2xl text-sm text-foreground/90">{profile.bio}</p> : null}
              </div>
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-2 md:flex-col md:items-end">
              <span className="inline-flex items-center rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
                {formatLastUpdated(account.lastSyncedAt)}
              </span>
              <CopyLink url={shareUrl} variant="compact" />
            </div>
          </div>
        </section>

        <StatBar
          columnsClassName="lg:grid-cols-[1.35fr_1fr_1fr_1fr]"
          items={[
            {
              label: "Followers",
              value: formatInteger(snapshot.followersCount),
              featured: true,
              delta: deltas.followers,
            },
            {
              label: "Engagement Rate",
              value: formatPercent(snapshot.engagementRate),
              muted: lowSample,
              tag: lowSample ? "Low sample size" : undefined,
              delta: deltas.engagementRate,
            },
            {
              label: "Avg Reel Views",
              value: avgReelViews === null ? null : formatInteger(Math.round(avgReelViews)),
              emptyCaption: AFTER_NEXT_SYNC,
              delta: deltas.avgReelViews,
            },
            {
              label: "Monthly Reach",
              value: snapshot.reach === null ? null : formatInteger(snapshot.reach),
              emptyCaption: AFTER_NEXT_SYNC,
              delta: deltas.monthlyReach,
            },
          ]}
        />

        <TrendSection history={trend} currentReach={snapshot.reach} currentEngagement={snapshot.engagementRate} />

        <AudienceSection followersCount={snapshot.followersCount} audience={audience} />

        <ContentSection posts={recentPosts} />

        <div className="flex justify-center">
          <a
            href={`https://www.instagram.com/${account.username}/`}
            target="_blank"
            rel="noreferrer"
            className="rounded-lg bg-primary px-6 py-3 text-sm font-medium text-white hover:bg-[#0086dd]"
          >
            Message on Instagram
          </a>
        </div>

        <VerificationBand lastSyncedAt={account.lastSyncedAt} />
      </div>
    </PageShell>
  );
}
