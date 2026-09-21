import { formatShare } from "@/lib/format";
import { AUDIENCE_MIN_FOLLOWERS } from "@/lib/instagram";
import type { AgeBrackets, GenderSplit } from "@/lib/data";
import type { PlaceShare } from "@/lib/instagram";

const AGE_ORDER = ["13-17", "18-24", "25-34", "35-44", "45-54", "55-64", "65+"];

type Props = {
  followersCount: number;
  audience: {
    ageBrackets: AgeBrackets;
    genderSplit: GenderSplit;
    topCities: PlaceShare[];
    topCountries: PlaceShare[];
  } | null;
  compact?: boolean;
};

function BarRow({ label, share }: { label: string; share: number }) {
  return (
    <div className="grid grid-cols-[7rem_1fr_3rem] items-center gap-2 text-sm">
      <span className="truncate text-muted-foreground">{label}</span>
      <div className="h-2 overflow-hidden rounded-full bg-border">
        <div className="h-full rounded-full bg-verified" style={{ width: `${Math.min(100, share * 100)}%` }} />
      </div>
      <span className="text-right tabular-nums text-foreground">{formatShare(share)}</span>
    </div>
  );
}

export function AudienceBreakdown({ followersCount, audience, compact = false }: Props) {
  if (followersCount < AUDIENCE_MIN_FOLLOWERS) {
    return (
      <div className="rounded-2xl border border-border bg-card p-5">
        <h2 className="font-display text-lg font-semibold text-foreground">Audience</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Audience insights unlock at 100 followers. Instagram withholds age, gender, and location
          breakdowns below that threshold. Keep posting — this section fills in automatically after
          you cross 100 and sync.
        </p>
      </div>
    );
  }

  if (!audience) {
    return (
      <div className="rounded-2xl border border-border bg-card p-5">
        <h2 className="font-display text-lg font-semibold text-foreground">Audience</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          No audience snapshot yet. Instagram can lag up to 48 hours on demographics. Use Sync now
          after that window, and confirm App Review includes instagram_business_manage_insights.
        </p>
      </div>
    );
  }

  const ages = (Object.keys(audience.ageBrackets).length
    ? Object.keys(audience.ageBrackets)
    : AGE_ORDER
  )
    .sort((a, b) => {
      const ia = AGE_ORDER.indexOf(a);
      const ib = AGE_ORDER.indexOf(b);
      if (ia === -1 && ib === -1) return a.localeCompare(b);
      if (ia === -1) return 1;
      if (ib === -1) return -1;
      return ia - ib;
    })
    .filter((key) => (audience.ageBrackets[key] ?? 0) > 0);

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <h2 className="font-display text-lg font-semibold text-foreground">Audience</h2>
      <p className="mt-1 text-xs text-muted-foreground">
        From Instagram Insights. Demographics can lag up to 48 hours behind follower count.
      </p>

      <div className={`mt-5 grid gap-6 ${compact ? "grid-cols-1" : "sm:grid-cols-2"}`}>
        <div>
          <h3 className="mb-3 text-sm font-medium text-foreground">Age</h3>
          <div className="space-y-2">
            {ages.length === 0 ? (
              <p className="text-sm text-muted-foreground">Age split not returned on this snapshot.</p>
            ) : (
              ages.map((key) => <BarRow key={key} label={key} share={audience.ageBrackets[key]} />)
            )}
          </div>
        </div>
        <div>
          <h3 className="mb-3 text-sm font-medium text-foreground">Gender</h3>
          <div className="space-y-2">
            <BarRow label="Female" share={audience.genderSplit.female} />
            <BarRow label="Male" share={audience.genderSplit.male} />
            <BarRow label="Undisclosed" share={audience.genderSplit.undisclosed} />
          </div>
        </div>
      </div>

      <div className={`mt-6 grid gap-6 ${compact ? "grid-cols-1" : "sm:grid-cols-2"}`}>
        <div>
          <h3 className="mb-3 text-sm font-medium text-foreground">Top cities</h3>
          {audience.topCities.length === 0 ? (
            <p className="text-sm text-muted-foreground">No city breakdown on this snapshot.</p>
          ) : (
            <div className="space-y-2">
              {audience.topCities.map((city) => (
                <BarRow key={city.name} label={city.name} share={city.share} />
              ))}
            </div>
          )}
        </div>
        <div>
          <h3 className="mb-3 text-sm font-medium text-foreground">Top countries</h3>
          {audience.topCountries.length === 0 ? (
            <p className="text-sm text-muted-foreground">No country breakdown on this snapshot.</p>
          ) : (
            <div className="space-y-2">
              {audience.topCountries.map((country) => (
                <BarRow key={country.name} label={country.name} share={country.share} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
