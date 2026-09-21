import { DEMO_RECENT } from "@/lib/demo-data";
import { formatInteger, formatPercent } from "@/lib/format";
import { roundToHour } from "@/lib/freshness";
import { FreshnessRing } from "./FreshnessRing";

export function RecentlyVerified() {
  const now = roundToHour(new Date());

  return (
    <section className="mt-20">
      <div className="mb-6">
        <h2 className="font-display text-2xl font-semibold text-foreground">Recently verified</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Sample data. Not a live directory of connected creators.
        </p>
      </div>
      <ul className="flex gap-4 overflow-x-auto pb-2">
        {DEMO_RECENT.map((creator) => {
          const lastSynced = new Date(now.getTime() - creator.syncedHoursAgo * 3_600_000);
          return (
            <li
              key={creator.handle}
              className="min-w-[220px] rounded-2xl border border-border bg-card p-4"
            >
              <FreshnessRing
                initials={creator.initials}
                lastSyncedAt={lastSynced}
                size={64}
                alt={creator.displayName}
                pulse
              />
              <p className="mt-3 font-display font-medium text-foreground">{creator.displayName}</p>
              <p className="text-sm text-muted-foreground">@{creator.handle}</p>
              <p className="mt-2 text-sm tabular-nums text-foreground">
                {formatInteger(creator.followers)} · {formatPercent(creator.engagement)}
              </p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
