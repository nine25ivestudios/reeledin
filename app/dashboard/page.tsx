import { redirect } from "next/navigation";
import { AudienceBreakdown } from "@/components/AudienceBreakdown";
import { ContentMixBar } from "@/components/ContentMixBar";
import { CopyLink } from "@/components/CopyLink";
import { FreshnessRing } from "@/components/FreshnessRing";
import { GrowthChart } from "@/components/GrowthChart";
import { PageShell } from "@/components/PageShell";
import { ProfileForm } from "@/components/ProfileForm";
import { RecentPostsGrid } from "@/components/RecentPostsGrid";
import { Stat } from "@/components/Stat";
import { SyncButton } from "@/components/SyncButton";
import { getDashboardData } from "@/lib/data";
import { getAppUrl } from "@/lib/env";
import { formatInteger, formatPercent, formatRelativeTime, integerDelta, percentDelta } from "@/lib/format";

export const dynamic = "force-dynamic";

function initialsFrom(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default async function DashboardPage() {
  const data = await getDashboardData();
  if (!data) redirect("/?error=session");

  const { account, snapshot, history, previous, audience, recentPosts, profile } = data;
  const publicUrl = profile ? `${getAppUrl()}/${profile.slug}` : null;
  const initials = initialsFrom(profile?.displayName || account?.username || "R");

  return (
    <PageShell showConnect={false} width="medium">
      {!account ? (
        <p className="mt-8 text-destructive">
          No Instagram account is connected to this session.{" "}
          <a className="underline" href="/api/auth/instagram">
            Connect Instagram
          </a>
          .
        </p>
      ) : (
        <div className="space-y-8 pt-4">
          <header className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <FreshnessRing
                initials={initials}
                lastSyncedAt={account.lastSyncedAt}
                alt={account.username}
                src={account.profilePictureUrl}
              />
              <div>
                <p className="font-display text-xl font-semibold text-foreground">
                  {profile?.displayName ?? account.username}
                </p>
                <p className="text-sm text-muted-foreground">@{account.username}</p>
                <p className="mt-1 text-sm text-muted-foreground">{formatRelativeTime(account.lastSyncedAt)}</p>
              </div>
            </div>
            <form action="/api/auth/logout" method="post">
              <button type="submit" className="text-sm text-muted-foreground hover:text-foreground">
                Sign out
              </button>
            </form>
          </header>

          {account.lastSyncError ? (
            <p className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              Last sync: {account.lastSyncError}
            </p>
          ) : null}

          <section>
            <div className="mb-4 flex items-center justify-between gap-4">
              <h2 className="font-display text-lg font-semibold text-foreground">Live stats</h2>
              <SyncButton />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Stat
                label="Followers"
                value={snapshot ? formatInteger(snapshot.followersCount) : "—"}
                delta={
                  snapshot
                    ? integerDelta(snapshot.followersCount, previous?.followersCount)
                    : null
                }
              />
              <Stat
                label="Engagement"
                value={snapshot ? formatPercent(snapshot.engagementRate) : "—"}
                muted={Boolean(snapshot && snapshot.postsAnalyzed < 5)}
                tag={snapshot && snapshot.postsAnalyzed < 5 ? "Low sample size" : undefined}
                delta={
                  snapshot ? percentDelta(snapshot.engagementRate, previous?.engagementRate) : null
                }
              />
              <Stat
                label="Avg likes"
                value={snapshot ? formatInteger(Math.round(snapshot.avgLikes)) : "—"}
                muted={Boolean(snapshot && snapshot.postsAnalyzed < 5)}
              />
              <Stat
                label="Avg comments"
                value={snapshot ? formatInteger(Math.round(snapshot.avgComments)) : "—"}
                muted={Boolean(snapshot && snapshot.postsAnalyzed < 5)}
              />
            </div>
            {snapshot ? (
              <p className="mt-3 text-xs text-muted-foreground">
                Engagement from {snapshot.postsAnalyzed} recent post
                {snapshot.postsAnalyzed === 1 ? "" : "s"}
                {snapshot.postsAnalyzed < 5 ? " — too few to treat as a stable rate" : ""} ·{" "}
                {formatInteger(snapshot.mediaCount)} posts on the account
              </p>
            ) : null}
          </section>

          <section className="rounded-2xl border border-border bg-card p-5">
            <h2 className="mb-4 font-display text-lg font-semibold text-foreground">Growth</h2>
            <GrowthChart history={history} />
          </section>

          <RecentPostsGrid posts={recentPosts} />
          <ContentMixBar posts={recentPosts} />

          <AudienceBreakdown
            followersCount={snapshot?.followersCount ?? 0}
            audience={audience}
          />

          <section className="rounded-2xl border border-border bg-card p-5">
            <h2 className="font-display text-lg font-semibold text-foreground">Share</h2>
            <p className="mt-1 mb-4 text-sm text-muted-foreground">
              Send this link to brands. It stays in sync with Instagram.
            </p>
            {publicUrl && profile?.isPublic ? (
              <CopyLink url={publicUrl} />
            ) : publicUrl ? (
              <p className="text-sm text-muted-foreground">
                Your profile is private. Turn on “Public link is visible” below to share {publicUrl}.
              </p>
            ) : (
              <p className="text-sm text-destructive">
                Your public profile is missing. Connect Instagram again to create it.
              </p>
            )}
          </section>

          <section className="rounded-2xl border border-border bg-card p-5">
            <h2 className="font-display text-xl font-semibold text-foreground">Profile</h2>
            <p className="mt-1 mb-6 text-sm text-muted-foreground">This copy appears on your public link.</p>
            {profile ? (
              <ProfileForm
                displayName={profile.displayName}
                niche={profile.niche}
                bio={profile.bio}
                isPublic={profile.isPublic}
              />
            ) : null}
          </section>
        </div>
      )}
    </PageShell>
  );
}
