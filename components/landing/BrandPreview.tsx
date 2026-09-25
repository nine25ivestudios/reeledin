import Link from "next/link";
import { VerifiedCheck } from "@/components/BrandMark";
import { PublicProfile } from "@/components/public/PublicProfile";
import { DEMO_SLUG, getDemoProfile } from "@/lib/demo-data";
import { getAppUrl } from "@/lib/env";
import { formatRelativeTime } from "@/lib/format";

const HIGHLIGHTS = [
  { label: "Followers", body: "The current count, from the connected account." },
  { label: "Engagement", body: "Calculated from recent posts, not typed in." },
  { label: "Audience", body: "Age and gender from Instagram Insights." },
  { label: "Location", body: "Top cities and countries." },
  { label: "Content performance", body: "The top post and recurring themes." },
  { label: "Verification status", body: "Every number comes from the account itself." },
  { label: "Last synced", body: "Brands can see exactly how current it is." },
];

export function BrandPreview() {
  const demo = getDemoProfile();
  const shareUrl = `${getAppUrl()}/${DEMO_SLUG}`;
  const host = shareUrl.replace(/^https?:\/\//, "");

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

      <dl className="mt-10 grid gap-x-6 gap-y-5 border-t border-border pt-6 sm:grid-cols-2 lg:grid-cols-4">
        {HIGHLIGHTS.map((item) => (
          <div key={item.label}>
            <dt className="font-display text-sm font-semibold text-foreground">{item.label}</dt>
            <dd className="mt-1 text-sm text-muted-foreground">{item.body}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-10 overflow-hidden rounded-2xl border border-border bg-background">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-card px-4 py-3">
          <div className="flex items-center gap-3">
            <span className="flex gap-1.5" aria-hidden="true">
              <span className="h-2.5 w-2.5 rounded-full bg-border" />
              <span className="h-2.5 w-2.5 rounded-full bg-border" />
              <span className="h-2.5 w-2.5 rounded-full bg-border" />
            </span>
            <span className="rounded-md bg-background px-3 py-1 text-xs text-muted-foreground">{host}</span>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 font-medium text-foreground">
              <VerifiedCheck className="h-3.5 w-3.5" />
              Verified directly from Instagram
            </span>
            <span className="rounded-full border border-border px-2.5 py-1 font-medium text-muted-foreground">
              {formatRelativeTime(demo.lastSyncedAt).replace(/^Synced/, "Last synced")}
            </span>
          </div>
        </div>

        <div className="relative max-h-[1150px] overflow-hidden">
          <div className="p-4 sm:p-6">
            <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Sample profile · fictional data
            </p>
            <PublicProfile profile={demo} shareUrl={shareUrl} instagramUrl={null} nameAs="h3" />
          </div>
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-56"
            style={{ background: "linear-gradient(to bottom, transparent, #000 85%)" }}
            aria-hidden="true"
          />
          <div className="absolute inset-x-0 bottom-6 flex justify-center">
            <Link
              href="/demo"
              className="rounded-lg border border-border bg-card px-5 py-3 text-sm font-medium text-foreground hover:border-primary"
            >
              See the full sample profile
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
