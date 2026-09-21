import { DEMO_LEADERBOARD } from "@/lib/demo-data";
import { formatInteger, formatPercent } from "@/lib/format";
import { roundToHour } from "@/lib/freshness";
import { FreshnessRing } from "./FreshnessRing";

export function Leaderboard() {
  const now = roundToHour(new Date());

  return (
    <section className="mt-20">
      <h2 className="font-display text-2xl font-semibold text-foreground">Leaderboard</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Sample data. Reeledin does not publish a searchable list of real creators.
      </p>
      <div className="mt-6 overflow-x-auto rounded-2xl border border-border">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-border text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">#</th>
              <th className="px-4 py-3 font-medium">Creator</th>
              <th className="px-4 py-3 font-medium">Niche</th>
              <th className="px-4 py-3 font-medium">Followers</th>
              <th className="px-4 py-3 font-medium">Engagement</th>
            </tr>
          </thead>
          <tbody>
            {DEMO_LEADERBOARD.map((creator, index) => {
              const lastSynced = new Date(now.getTime() - creator.syncedHoursAgo * 3_600_000);
              return (
                <tr
                  key={creator.handle}
                  className="border-b border-border last:border-0 odd:bg-white/[0.015] hover:bg-white/[0.04]"
                >
                  <td className="px-4 py-3 tabular-nums text-muted-foreground">{index + 1}</td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-3">
                      <FreshnessRing
                        initials={creator.initials}
                        lastSyncedAt={lastSynced}
                        size={36}
                        alt={creator.displayName}
                        pulse
                      />
                      <span>
                        <span className="text-foreground">{creator.displayName}</span>
                        <span className="ml-2 text-muted-foreground">@{creator.handle}</span>
                      </span>
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{creator.niche}</td>
                  <td className="px-4 py-3 tabular-nums text-foreground">{formatInteger(creator.followers)}</td>
                  <td className="px-4 py-3 tabular-nums text-foreground">{formatPercent(creator.engagement)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
