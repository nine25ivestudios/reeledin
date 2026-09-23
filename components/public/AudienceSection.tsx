import type { AudienceView, GenderSplit } from "@/lib/data";
import { formatDecimal, formatShare } from "@/lib/format";
import { cityName, countryFlag, countryName } from "@/lib/geo";
import { AUDIENCE_MIN_FOLLOWERS } from "@/lib/instagram";
import { LocationsCard } from "./LocationsCard";
import { RankedBar } from "./RankedBar";

const AGE_ORDER = ["13-17", "18-24", "25-34", "35-44", "45-54", "55-64", "65+"];

function ageLabel(key: string) {
  return key.replace("-", "–");
}

/** Same rounding as the displayed percentage, so a row never renders as "0%". */
function visibleShare(share: number) {
  return Math.round(share * 100) > 0;
}

function rankedAges(ageBrackets: Record<string, number>) {
  return Object.entries(ageBrackets)
    .filter(([, share]) => visibleShare(share))
    .sort((a, b) => b[1] - a[1] || AGE_ORDER.indexOf(a[0]) - AGE_ORDER.indexOf(b[0]));
}

function HeroFigure({
  share,
  label,
  caption,
  color,
}: {
  share: number;
  label: React.ReactNode;
  caption: string;
  color: string;
}) {
  return (
    <div className="min-w-0">
      <p
        className="font-display font-semibold leading-[0.9] tabular-nums text-foreground"
        style={{ fontSize: "clamp(78px, 9vw, 124px)", letterSpacing: "-0.055em" }}
      >
        {formatDecimal(share * 100, 0)}
        <span className="text-muted-foreground" style={{ fontSize: "0.45em", letterSpacing: "-0.02em" }}>
          %
        </span>
      </p>
      <p className="mt-4 font-display text-xl font-semibold text-foreground">{label}</p>
      <p className="mt-1 text-sm text-muted-foreground">{caption}</p>
      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-border">
        <div className="h-full rounded-full" style={{ width: `${Math.min(100, share * 100)}%`, background: color }} />
      </div>
    </div>
  );
}

function GenderBar({ split }: { split: GenderSplit }) {
  const segments = [
    { key: "men", label: "Men", share: split.male, color: "var(--blue)" },
    { key: "women", label: "Women", share: split.female, color: "var(--violet)" },
    { key: "unspecified", label: "Unspecified", share: split.undisclosed, color: "var(--chart-gray)" },
  ];
  const total = segments.reduce((sum, s) => sum + s.share, 0);

  if (total <= 0) {
    return <p className="text-sm text-muted-foreground">Instagram did not return a gender split on this snapshot.</p>;
  }

  return (
    <div>
      <div className="grid grid-cols-3 gap-3">
        {segments.map((s) => (
          <div key={s.key}>
            <p className="font-display text-2xl font-bold tabular-nums text-foreground">{formatShare(s.share)}</p>
            <p className="mt-0.5 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="h-2 w-2 rounded-full" style={{ background: s.color }} />
              {s.label}
            </p>
          </div>
        ))}
      </div>
      <div className="mt-4 flex h-3 overflow-hidden rounded-full bg-border" role="img" aria-label="Gender split">
        {segments
          .filter((s) => s.share > 0)
          .map((s) => (
            <div key={s.key} className="h-full" style={{ width: `${(s.share / total) * 100}%`, background: s.color }} />
          ))}
      </div>
    </div>
  );
}

function Notice({ title, body }: { title: string; body: string }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
      <h2 className="font-display text-lg font-semibold text-foreground">{title}</h2>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{body}</p>
    </section>
  );
}

export function AudienceSection({ followersCount, audience }: { followersCount: number; audience: AudienceView | null }) {
  if (followersCount < AUDIENCE_MIN_FOLLOWERS) {
    return (
      <Notice
        title="Audience"
        body="Instagram only shares age, gender, and location breakdowns for accounts with at least 100 followers. This section fills in automatically once the account crosses that threshold."
      />
    );
  }
  if (!audience) {
    return (
      <Notice
        title="Audience"
        body="No audience snapshot yet. Instagram can take up to 48 hours to report demographics for a newly connected account."
      />
    );
  }

  const ages = rankedAges(audience.ageBrackets);
  const topAge = ages[0] ?? null;
  const topCity = audience.topCities[0] ?? null;
  const topCountry = audience.topCountries[0] ?? null;
  const topCountryFlag = topCountry ? countryFlag(topCountry.name) : null;

  return (
    <div className="space-y-3">
      {topAge || topCity || topCountry ? (
        <section className="grid overflow-hidden rounded-2xl border border-border bg-card md:grid-cols-2">
          <div className="p-6 sm:p-8">
            {topAge ? (
              <HeroFigure
                share={topAge[1]}
                label={ageLabel(topAge[0])}
                caption="largest audience age group"
                color="var(--violet)"
              />
            ) : (
              <p className="text-sm text-muted-foreground">Instagram did not return an age breakdown on this snapshot.</p>
            )}
          </div>
          <div className="border-t border-border p-6 sm:p-8 md:border-l md:border-t-0">
            {topCity ? (
              <HeroFigure
                share={topCity.share}
                label={cityName(topCity.name)}
                caption="largest audience city"
                color="var(--blue)"
              />
            ) : topCountry ? (
              <HeroFigure
                share={topCountry.share}
                label={
                  <span className="inline-flex items-center gap-2">
                    {topCountryFlag ? (
                      <span className="flag" aria-hidden="true">
                        {topCountryFlag}
                      </span>
                    ) : null}
                    {countryName(topCountry.name)}
                  </span>
                }
                caption="largest audience country"
                color="var(--blue)"
              />
            ) : (
              <p className="text-sm text-muted-foreground">Instagram did not return a location breakdown on this snapshot.</p>
            )}
          </div>
        </section>
      ) : null}

      <div className="grid gap-3 md:grid-cols-2">
        <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
          <h2 className="font-display text-lg font-semibold text-foreground">Age</h2>
          {ages.length === 0 ? (
            <p className="mt-2 text-sm text-muted-foreground">Instagram did not return an age breakdown on this snapshot.</p>
          ) : (
            <div className="mt-5 space-y-3">
              {ages.map(([key, share]) => (
                <RankedBar key={key} label={ageLabel(key)} share={share} color="var(--violet)" />
              ))}
            </div>
          )}

          <h3 className="mt-8 font-display text-lg font-semibold text-foreground">Gender</h3>
          <div className="mt-4">
            <GenderBar split={audience.genderSplit} />
          </div>
        </section>

        <LocationsCard cities={audience.topCities} countries={audience.topCountries} />
      </div>
      <p className="px-1 text-xs text-muted-foreground">
        From Instagram Insights. Demographics can lag up to 48 hours behind follower count.
      </p>
    </div>
  );
}
