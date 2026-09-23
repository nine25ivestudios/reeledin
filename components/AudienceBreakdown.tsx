"use client";

import { useState } from "react";
import { formatInteger, formatShare } from "@/lib/format";
import { AUDIENCE_MIN_FOLLOWERS, type PlaceShare } from "@/lib/instagram";
import type { AgeBrackets, GenderSplit } from "@/lib/data";

const AGE_ORDER = ["13-17", "18-24", "25-34", "35-44", "45-54", "55-64", "65+"];
const VIOLET = "#8B7CF8";

type GenderKey = "women" | "men" | "unspecified";

function BarRow({ label, share, color = VIOLET }: { label: string; share: number; color?: string }) {
  return (
    <div className="grid grid-cols-[minmax(0,7.5rem)_1fr_2.75rem] items-center gap-2 text-sm sm:grid-cols-[minmax(0,9rem)_1fr_3rem]">
      <span className="text-muted-foreground">{label}</span>
      <div className="h-2 overflow-hidden rounded-full bg-border">
        <div className="h-full rounded-full" style={{ width: `${Math.min(100, share * 100)}%`, background: color }} />
      </div>
      <span className="text-right font-display tabular-nums text-foreground">{formatShare(share)}</span>
    </div>
  );
}

function cityLabel(raw: string): string {
  const city = raw.split(",")[0]?.trim();
  return city || raw;
}

function polar(cx: number, cy: number, r: number, angleDeg: number) {
  const a = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
}

function donutArc(cx: number, cy: number, r: number, startFrac: number, endFrac: number) {
  const start = polar(cx, cy, r, startFrac * 360);
  const end = polar(cx, cy, r, endFrac * 360);
  const large = endFrac - startFrac > 0.5 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${large} 1 ${end.x} ${end.y}`;
}

function GenderDonut({
  split,
  followersCount,
}: {
  split: GenderSplit;
  followersCount: number;
}) {
  const [hovered, setHovered] = useState<GenderKey | null>(null);
  const segments: Array<{ key: GenderKey; label: string; value: number; color: string }> = [
    { key: "women", label: "Women", value: split.female, color: VIOLET },
    { key: "men", label: "Men", value: split.male, color: "var(--primary)" },
    { key: "unspecified", label: "Unspecified", value: split.undisclosed, color: "#6b6b6b" },
  ];
  const visible = segments.filter((s) => s.value > 0);
  let cursor = 0;
  const arcs = visible.map((s) => {
    const start = cursor;
    cursor += s.value;
    return { ...s, start, end: cursor };
  });

  return (
    <div>
      <div className="relative mx-auto h-40 w-40">
        <svg viewBox="0 0 100 100" className="h-full w-full" aria-hidden="true">
          <circle cx="50" cy="50" r="36" fill="none" stroke="var(--border)" strokeWidth="12" />
          {arcs.map((s) => {
            const active = hovered === null || hovered === s.key;
            const style = {
              fill: "none",
              stroke: s.color,
              strokeWidth: 12,
              opacity: active ? 1 : 0.35,
            } as const;
            const events = {
              className: "cursor-pointer transition-opacity duration-150",
              onMouseEnter: () => setHovered(s.key),
              onMouseLeave: () => setHovered(null),
            };
            if (s.end - s.start >= 0.999) {
              return <circle key={s.key} cx="50" cy="50" r="36" {...style} {...events} />;
            }
            return (
              <path
                key={s.key}
                d={donutArc(50, 50, 36, s.start, s.end)}
                strokeLinecap="butt"
                {...style}
                {...events}
              />
            );
          })}
        </svg>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <p className="font-display text-xl font-semibold tabular-nums text-foreground">
            {formatInteger(followersCount)}
          </p>
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Followers</p>
        </div>
      </div>
      <ul className="mt-4 space-y-1">
        {segments.map((s) => {
          const active = hovered === null || hovered === s.key;
          return (
            <li key={s.key}>
              <button
                type="button"
                className="flex w-full items-center justify-between gap-3 rounded-lg px-1 py-1 text-left text-sm transition-opacity duration-150"
                style={{ opacity: active ? 1 : 0.35 }}
                onMouseEnter={() => setHovered(s.key)}
                onMouseLeave={() => setHovered(null)}
                onFocus={() => setHovered(s.key)}
                onBlur={() => setHovered(null)}
              >
                <span className="inline-flex items-center gap-2 text-muted-foreground">
                  <span className="h-2 w-2 rounded-full" style={{ background: s.color }} />
                  {s.label}
                </span>
                <span className="font-display tabular-nums text-foreground">{formatShare(s.value)}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function LocationLists({ cities, countries }: { cities: PlaceShare[]; countries: PlaceShare[] }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-display text-lg font-semibold text-foreground">Locations</h3>
        <p className="mt-3 mb-2 text-xs uppercase tracking-wide text-muted-foreground">Cities</p>
        {cities.length === 0 ? (
          <p className="text-sm text-muted-foreground">No city breakdown on this snapshot.</p>
        ) : (
          <div className="space-y-2">
            {cities.map((row) => (
              <BarRow key={row.name} label={cityLabel(row.name)} share={row.share} color="var(--primary)" />
            ))}
          </div>
        )}
      </div>
      <div>
        <p className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">Countries</p>
        {countries.length === 0 ? (
          <p className="text-sm text-muted-foreground">No country breakdown on this snapshot.</p>
        ) : (
          <div className="space-y-2">
            {countries.map((row) => (
              <BarRow key={row.name} label={row.name} share={row.share} color="var(--primary)" />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

type Props = {
  followersCount: number;
  audience: {
    ageBrackets: AgeBrackets;
    genderSplit: GenderSplit;
    topCities: PlaceShare[];
    topCountries: PlaceShare[];
  } | null;
};

export function AudienceBreakdown({ followersCount, audience }: Props) {
  if (followersCount < AUDIENCE_MIN_FOLLOWERS) {
    return (
      <div className="rounded-2xl border border-border bg-card p-5">
        <h2 className="font-display text-lg font-semibold text-foreground">Age & Gender</h2>
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
      <div className="grid gap-3 lg:grid-cols-2">
        <section className="rounded-2xl border border-border bg-card p-5">
          <h2 className="font-display text-lg font-semibold text-foreground">Age & Gender</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            No audience snapshot yet. Instagram can lag up to 48 hours on demographics.
          </p>
        </section>
        <section className="rounded-2xl border border-border bg-card p-5">
          <h3 className="font-display text-lg font-semibold text-foreground">Locations</h3>
          <p className="mt-2 text-sm text-muted-foreground">Location breakdown arrives with the same snapshot.</p>
        </section>
      </div>
    );
  }

  return (
    <div className="grid gap-3 lg:grid-cols-2">
      <section className="rounded-2xl border border-border bg-card p-5">
        <h2 className="font-display text-lg font-semibold text-foreground">Age & Gender</h2>
        <p className="mt-1 mb-4 text-xs text-muted-foreground">
          From Instagram Insights. Demographics can lag up to 48 hours.
        </p>
        <GenderDonut split={audience.genderSplit} followersCount={followersCount} />
        <div className="mt-6 space-y-2">
          {AGE_ORDER.filter((key) => Math.round((audience.ageBrackets[key] ?? 0) * 100) > 0).map((key) => (
            <BarRow key={key} label={key} share={audience.ageBrackets[key]} />
          ))}
        </div>
      </section>
      <section className="rounded-2xl border border-border bg-card p-5">
        <LocationLists cities={audience.topCities} countries={audience.topCountries} />
      </section>
    </div>
  );
}
