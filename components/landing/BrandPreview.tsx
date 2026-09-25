import Link from "next/link";
import { ProfileHeader, ProfileStats } from "@/components/public/PublicProfile";
import { TrendSection } from "@/components/TrendSection";
import { DEMO_SLUG, getDemoProfile } from "@/lib/demo-data";
import { getAppUrl } from "@/lib/env";

export function BrandPreview() {
  const demo = getDemoProfile();
  const host = `${getAppUrl()}/${DEMO_SLUG}`.replace(/^https?:\/\//, "");

  return (
    <section className="mt-28">
      <p className="text-sm font-medium text-muted-foreground">What the brand sees</p>
      <h2 className="mt-3 max-w-3xl font-display text-3xl font-semibold leading-tight text-foreground sm:text-5xl">
        Don&apos;t send them your analytics.
        <br />
        Send them your profile.
      </h2>
      <p className="mt-5 max-w-2xl text-lg text-muted-foreground">
        No Insights screenshots. You send <span className="text-foreground">reeledin.com/your-handle</span>, and
        the brand opens a clean, current profile with the numbers they actually ask about.
      </p>

      <div className="mx-auto mt-10 max-w-4xl sm:mt-14 overflow-hidden rounded-2xl border border-border bg-background shadow-[0_30px_80px_-40px_rgba(0,0,0,0.9)]">
        <div className="flex items-center gap-3 border-b border-border bg-card px-4 py-2.5">
          <span className="flex shrink-0 gap-1.5" aria-hidden="true">
            <span className="h-2.5 w-2.5 rounded-full bg-border" />
            <span className="h-2.5 w-2.5 rounded-full bg-border" />
            <span className="h-2.5 w-2.5 rounded-full bg-border" />
          </span>
          <span className="min-w-0 flex-1 truncate rounded-md bg-background px-3 py-1 text-center text-xs text-muted-foreground">
            {host}
          </span>
          <span className="w-[42px] shrink-0" aria-hidden="true" />
        </div>

        <div className="relative max-h-[560px] overflow-hidden sm:max-h-[420px]">
          <div className="space-y-3 p-3 sm:space-y-4 sm:p-6">
            <ProfileHeader profile={demo} shareUrl={null} nameAs="h3" compact />
            <ProfileStats profile={demo} />
            <TrendSection trends={demo.trends} currentReach={demo.reach} currentEngagement={demo.engagementRate} />
          </div>
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-28"
            style={{ background: "linear-gradient(to bottom, transparent, #000 85%)" }}
            aria-hidden="true"
          />
        </div>
      </div>

      <div className="mt-6 flex flex-col items-center gap-3">
        <Link href="/demo" className="btn-primary px-5 py-3 text-sm">
          See the full profile
        </Link>
        <p className="text-xs text-muted-foreground">Sample profile · fictional data</p>
      </div>
    </section>
  );
}
