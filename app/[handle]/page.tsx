import { notFound } from "next/navigation";
import { AudienceBreakdown } from "@/components/AudienceBreakdown";
import { VerifiedCheck } from "@/components/BrandMark";
import { FreshnessRing } from "@/components/FreshnessRing";
import { PageShell } from "@/components/PageShell";
import { Stat } from "@/components/Stat";
import { getPublicCredential } from "@/lib/data";
import { formatInteger, formatPercent, formatRelativeTime } from "@/lib/format";

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

  const { profile, account, snapshot, audience } = data;
  const initials = profile.displayName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <PageShell showConnect={false} width="narrow">
      <article className="rounded-2xl border border-border bg-card px-5 py-10 text-center sm:px-8">
        <p className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-verified">
          <VerifiedCheck className="h-3.5 w-3.5" />
          Verified, not self-reported
        </p>
        <div className="mt-6 flex justify-center">
          <FreshnessRing
            initials={initials || "R"}
            lastSyncedAt={account.lastSyncedAt}
            size={112}
            alt={profile.displayName}
            src={account.profilePictureUrl}
          />
        </div>
        <h1 className="mt-5 font-display text-3xl font-semibold text-foreground">{profile.displayName}</h1>
        <p className="mt-1 text-muted-foreground">
          @{account.username}
          {profile.niche ? ` · ${profile.niche}` : ""}
        </p>
        {profile.bio ? <p className="mt-4 text-left text-foreground/90">{profile.bio}</p> : null}

        <div className="mt-8 grid grid-cols-2 gap-3 text-left">
          <Stat label="Followers" value={formatInteger(snapshot.followersCount)} />
          <Stat label="Engagement" value={formatPercent(snapshot.engagementRate)} />
          <Stat label="Avg likes" value={formatInteger(Math.round(snapshot.avgLikes))} />
          <Stat label="Avg comments" value={formatInteger(Math.round(snapshot.avgComments))} />
        </div>

        <div className="mt-6 text-left">
          <AudienceBreakdown
            followersCount={snapshot.followersCount}
            audience={audience}
            compact
          />
        </div>

        <p className="mt-8 text-sm text-muted-foreground">
          {formatRelativeTime(account.lastSyncedAt)} · Source: Instagram API
        </p>
      </article>
    </PageShell>
  );
}
