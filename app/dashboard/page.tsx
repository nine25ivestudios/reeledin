import { redirect } from "next/navigation";
import { PageShell } from "@/components/PageShell";
import { PublicProfile } from "@/components/public/PublicProfile";
import { SyncButton } from "@/components/SyncButton";
import { VisibilityToggle } from "@/components/VisibilityToggle";
import { getDashboardData } from "@/lib/data";
import { getAppUrl } from "@/lib/env";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const data = await getDashboardData();
  if (!data) redirect("/?error=session");

  const { account, profile, view } = data;

  if (!account || !profile) {
    return (
      <PageShell showConnect={false} width="profile">
        <p className="mt-8 rounded-2xl border border-border bg-card px-5 py-4 text-sm text-destructive">
          No Instagram account is connected to this session.{" "}
          <a className="underline" href="/api/auth/instagram">
            Connect Instagram
          </a>
          .
        </p>
      </PageShell>
    );
  }

  const publicUrl = `${getAppUrl()}/${profile.slug}`;
  const displayUrl = publicUrl.replace(/^https?:\/\//, "");

  return (
    <PageShell showConnect={false} width="profile">
      <div className="space-y-6 pt-6">
        {account.lastSyncError ? (
          <p className="rounded-2xl border border-border bg-card px-5 py-4 text-sm text-destructive">
            Last sync: {account.lastSyncError}
          </p>
        ) : null}

        <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Your ReeledIn</p>
              {profile.isPublic ? (
                <a
                  href={`/${profile.slug}`}
                  className="mt-1 block truncate font-display text-lg font-semibold text-foreground hover:text-primary"
                >
                  {displayUrl}
                </a>
              ) : (
                <p className="mt-1 truncate font-display text-lg font-semibold text-muted-foreground">{displayUrl}</p>
              )}
            </div>
            <div className="flex shrink-0 items-start gap-2">
              <SyncButton compact />
              <form action="/api/auth/logout" method="post">
                <button
                  type="submit"
                  className="btn-secondary px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground"
                >
                  Sign out
                </button>
              </form>
            </div>
          </div>

          <div className="mt-5 border-t border-border pt-5">
            <VisibilityToggle initial={profile.isPublic} />
          </div>

          <p className="mt-4 text-xs text-muted-foreground">
            Your name and bio come from your Instagram profile and refresh on every sync. To change them, edit
            them on Instagram.
          </p>
        </section>

        {view ? (
          <PublicProfile
            profile={view}
            shareUrl={profile.isPublic ? publicUrl : null}
            instagramUrl={`https://www.instagram.com/${view.username}/`}
          />
        ) : (
          <p className="rounded-2xl border border-border bg-card px-5 py-4 text-sm text-muted-foreground">
            No stats yet. Use Sync now to pull your numbers from Instagram.
          </p>
        )}
      </div>
    </PageShell>
  );
}
