import { notFound } from "next/navigation";
import { PageShell } from "@/components/PageShell";
import { PublicProfile } from "@/components/public/PublicProfile";
import { getPublicCredential } from "@/lib/data";
import { getAppUrl } from "@/lib/env";

export const dynamic = "force-dynamic";

type Props = { params: { handle: string } };

export async function generateMetadata({ params }: Props) {
  return {
    title: `@${params.handle} — Reeledin`,
    description: "Verified Instagram stats. Not self-reported.",
  };
}

export default async function PublicProfilePage({ params }: Props) {
  const profile = await getPublicCredential(params.handle);
  if (!profile) notFound();

  const shareUrl = `${getAppUrl()}/${profile.slug}`;

  return (
    <PageShell showConnect={false} width="profile" headerNote={shareUrl.replace(/^https?:\/\//, "")}>
      <div className="pt-6">
        <PublicProfile
          profile={profile}
          shareUrl={shareUrl}
          instagramUrl={`https://www.instagram.com/${profile.username}/`}
        />
      </div>
    </PageShell>
  );
}
