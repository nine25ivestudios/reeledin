"use client";

import { useState } from "react";
import { cityName, countryFlag, countryName } from "@/lib/geo";
import type { PlaceShare } from "@/lib/instagram";
import { RankedBar } from "./RankedBar";

type Tab = "cities" | "countries";

export function LocationsCard({ cities, countries }: { cities: PlaceShare[]; countries: PlaceShare[] }) {
  const [tab, setTab] = useState<Tab>("cities");

  const toggle = (value: Tab, label: string) => (
    <button
      type="button"
      aria-pressed={tab === value}
      onClick={() => setTab(value)}
      className={`rounded-full px-3 py-1 transition-colors ${
        tab === value ? "bg-background text-foreground" : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {label}
    </button>
  );

  return (
    <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
      <div className="mb-5 flex items-center justify-between gap-3">
        <h2 className="font-display text-lg font-semibold text-foreground">Locations</h2>
        <div className="loc-toggle flex rounded-full border border-border p-0.5 text-xs">
          {toggle("cities", "Cities")}
          {toggle("countries", "Countries")}
        </div>
      </div>

      <div className="loc-panel" data-active={tab === "cities"}>
        <p className="loc-print-label mb-2 text-xs uppercase tracking-wide text-muted-foreground">Cities</p>
        {cities.length === 0 ? (
          <p className="text-sm text-muted-foreground">Instagram did not return a city breakdown on this snapshot.</p>
        ) : (
          <div className="space-y-3">
            {cities.map((row) => (
              <RankedBar key={row.name} label={cityName(row.name)} share={row.share} color="var(--blue)" />
            ))}
          </div>
        )}
      </div>

      <div className="loc-panel" data-active={tab === "countries"}>
        <p className="loc-print-label mb-2 text-xs uppercase tracking-wide text-muted-foreground">Countries</p>
        {countries.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Instagram did not return a country breakdown on this snapshot.
          </p>
        ) : (
          <div className="space-y-3">
            {countries.map((row) => {
              const flag = countryFlag(row.name);
              return (
                <RankedBar
                  key={row.name}
                  label={
                    <span className="inline-flex items-center gap-2">
                      {flag ? (
                        <span className="flag text-base leading-none" aria-hidden="true">
                          {flag}
                        </span>
                      ) : null}
                      {countryName(row.name)}
                    </span>
                  }
                  share={row.share}
                  color="var(--blue)"
                />
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
