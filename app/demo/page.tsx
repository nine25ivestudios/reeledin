import { PageShell } from "@/components/PageShell";
import { PublicProfile } from "@/components/public/PublicProfile";
import { getDemoProfile, DEMO_SLUG } from "@/lib/demo-data";
import { getAppUrl } from "@/lib/env";

// Demo timestamps are hour-rounded, so a 30-minute cache keeps "Synced 1h ago" honest and lets <Link> prefetch the full page.
export const revalidate = 1800;

export const metadata = {
  title: "Sample profile — Reeledin",
  description: "A fictional sample of a Reeledin creator profile, for demonstration purposes.",
  robots: { index: false },
};

export default function DemoProfilePage() {
  const profile = getDemoProfile();
  const shareUrl = `${getAppUrl()}/${DEMO_SLUG}`;

  return (
    <PageShell showConnect width="wide" headerNote={shareUrl.replace(/^https?:\/\//, "")}>
      <div className="pt-6">
        <div className="mb-4 flex flex-col gap-1 rounded-xl border border-dashed border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground">Sample profile</p>
          <p className="text-xs text-muted-foreground">
            For demonstration purposes. Fictional creator, fictional numbers.
          </p>
        </div>
        <PublicProfile profile={profile} shareUrl={shareUrl} instagramUrl={null} />
      </div>
    </PageShell>
  );
}
