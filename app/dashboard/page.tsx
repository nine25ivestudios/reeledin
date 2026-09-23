import { redirect } from "next/navigation";
import { CredentialView, initialsFrom } from "@/components/CredentialView";
import { PageShell } from "@/components/PageShell";
import { ProfileForm } from "@/components/ProfileForm";
import { SyncButton } from "@/components/SyncButton";
import { getDashboardData } from "@/lib/data";
import { getAppUrl } from "@/lib/env";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const data = await getDashboardData();
  if (!data) redirect("/?error=session");

  const { account, snapshot, audience, recentPosts, deltas, trend, avgReelViews, profile } = data;
  const publicUrl = profile ? `${getAppUrl()}/${profile.slug}` : null;

  return (
    <PageShell showConnect={false} width="wide">
      {!account ? (
        <p className="mt-8 text-destructive">
          No Instagram account is connected to this session.{" "}
          <a className="underline" href="/api/auth/instagram">
            Connect Instagram
          </a>
          .
        </p>
      ) : (
        <div>
          {account.lastSyncError ? (
            <p className="mt-4 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              Last sync: {account.lastSyncError}
            </p>
          ) : null}

          <CredentialView
            model={{
              displayName: profile?.displayName ?? account.username,
              username: account.username,
              bio: profile?.bio ?? "",
              initials: initialsFrom(profile?.displayName || account.username || "R"),
              profilePictureUrl: account.profilePictureUrl,
              lastSyncedAt: account.lastSyncedAt,
              shareUrl: publicUrl && profile?.isPublic ? publicUrl : null,
              followers: snapshot?.followersCount ?? 0,
              engagementRate: snapshot?.engagementRate ?? 0,
              avgReelViews,
              monthlyReach: snapshot?.reach ?? null,
              postsAnalyzed: snapshot?.postsAnalyzed ?? 0,
              deltas,
              trend,
              audience,
              recentPosts,
            }}
            actions={
              <>
                <SyncButton compact />
                <form action="/api/auth/logout" method="post">
                  <button
                    type="submit"
                    className="rounded-lg border border-border px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground"
                  >
                    Sign out
                  </button>
                </form>
              </>
            }
          />

          <section className="mt-2 rounded-2xl border border-border bg-card p-5">
            <h2 className="font-display text-xl font-semibold text-foreground">Profile</h2>
            <p className="mt-1 mb-6 text-sm text-muted-foreground">
              Display name and bio appear on your public link. Instagram does not expose a category
              field on this API path, so Reeledin does not invent niche tags.
            </p>
            {profile ? (
              <ProfileForm
                displayName={profile.displayName}
                niche={profile.niche}
                bio={profile.bio}
                isPublic={profile.isPublic}
              />
            ) : null}
            {publicUrl && !profile?.isPublic ? (
              <p className="mt-4 text-sm text-muted-foreground">
                Your profile is private. Turn on “Public link is visible” to share {publicUrl}.
              </p>
            ) : null}
          </section>
        </div>
      )}
    </PageShell>
  );
}
