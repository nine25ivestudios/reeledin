import { hoursSinceSync } from "./freshness";

export function formatInteger(value: number): string {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(value);
}

const COMPACT_FROM = 10_000;
const COMPACT_UNITS = [
  { size: 1e3, suffix: "K", digits: 1 },
  { size: 1e6, suffix: "M", digits: 2 },
  { size: 1e9, suffix: "B", digits: 2 },
] as const;

/**
 * Headline value plus the exact count to print beneath it. Below 10,000 the exact number is
 * already short, so `exact` is null and nothing is repeated.
 */
export function compactNumber(value: number): { short: string; exact: string | null } {
  const exact = formatInteger(value);
  const abs = Math.abs(value);
  if (abs < COMPACT_FROM) return { short: exact, exact: null };

  let index = COMPACT_UNITS.length - 1;
  while (index > 0 && abs < COMPACT_UNITS[index].size) index -= 1;
  let unit = COMPACT_UNITS[index];
  let scaled = Number((value / unit.size).toFixed(unit.digits));
  // 999,960 rounds to 1000.0K; promote so it reads 1M.
  if (Math.abs(scaled) >= 1000 && index < COMPACT_UNITS.length - 1) {
    unit = COMPACT_UNITS[index + 1];
    scaled = Number((value / unit.size).toFixed(unit.digits));
  }
  const short = `${new Intl.NumberFormat("en-US", { maximumFractionDigits: unit.digits }).format(scaled)}${unit.suffix}`;
  return { short, exact };
}

export function formatDecimal(value: number, digits = 1): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
}

export const LOW_SAMPLE_POSTS = 5;

export function isLowSample(postsAnalyzed: number): boolean {
  return postsAnalyzed > 0 && postsAnalyzed < LOW_SAMPLE_POSTS;
}

export const AFTER_NEXT_SYNC = "Available after next sync";

export function initialsFrom(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function formatPercent(value: number): string {
  return `${formatDecimal(value, 1)}%`;
}

export function formatShare(value: number): string {
  return `${formatDecimal(value * 100, 0)}%`;
}

export function formatRelativeTime(date: Date | string | null | undefined): string {
  if (!date) return "Never synced";
  const hours = hoursSinceSync(date);
  if (hours === null) return "Unknown sync time";
  if (hours < 1) return "Synced just now";
  if (hours === 1) return "Synced 1h ago";
  if (hours < 48) return `Synced ${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `Synced ${days}d ago`;
}

export function formatLastUpdated(date: Date | string | null | undefined): string {
  if (!date) return "last updated —";
  const hours = hoursSinceSync(date);
  if (hours === null) return "last updated —";
  if (hours < 1) return "last updated just now";
  if (hours === 1) return "last updated 1h ago";
  if (hours < 48) return `last updated ${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `last updated ${days}d ago`;
}

export function formatPostDate(iso: string | null | undefined): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short" }).format(date);
}

export type StatDelta = { amount: string; direction: "up" | "down" | "flat" };

export function snapshotClosestToDaysAgo<T extends { takenAt: Date }>(
  history: T[],
  days = 30,
  now = new Date(),
): T | null {
  if (history.length === 0) return null;
  const sorted = [...history].sort((a, b) => a.takenAt.getTime() - b.takenAt.getTime());
  const oldest = sorted[0];
  if (now.getTime() - oldest.takenAt.getTime() < days * 24 * 60 * 60 * 1000) return null;
  const target = now.getTime() - days * 24 * 60 * 60 * 1000;
  return sorted.reduce((best, row) =>
    Math.abs(row.takenAt.getTime() - target) < Math.abs(best.takenAt.getTime() - target) ? row : best,
  );
}

export function relativePercentDelta(
  current: number | null | undefined,
  baseline: number | null | undefined,
  versus = "vs last 30 days",
): StatDelta | null {
  if (current === null || current === undefined) return null;
  if (baseline === null || baseline === undefined) return null;
  if (baseline === 0) return null;
  const pct = ((current - baseline) / baseline) * 100;
  if (!Number.isFinite(pct)) return null;
  if (Math.abs(pct) < 0.05) {
    return { amount: `0.0% ${versus}`, direction: "flat" };
  }
  const signed = `${pct > 0 ? "+" : ""}${formatDecimal(pct, 1)}% ${versus}`;
  return {
    amount: signed,
    direction: pct > 0 ? "up" : "down",
  };
}

/** Daily history is keyed by UTC midnight, so the label has to read the UTC calendar day. */
export function formatChartDay(date: Date): string {
  return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", timeZone: "UTC" }).format(date);
}

export function integerDelta(
  current: number,
  previous: number | null | undefined,
): { amount: string; direction: "up" | "down" | "flat" } | null {
  if (previous === null || previous === undefined) return null;
  const diff = current - previous;
  if (diff === 0) return { amount: "0", direction: "flat" };
  return {
    amount: formatInteger(Math.abs(Math.round(diff))),
    direction: diff > 0 ? "up" : "down",
  };
}

export function percentDelta(
  current: number,
  previous: number | null | undefined,
): { amount: string; direction: "up" | "down" | "flat" } | null {
  if (previous === null || previous === undefined) return null;
  const diff = current - previous;
  if (Math.abs(diff) < 0.05) return { amount: "0.0%", direction: "flat" };
  return {
    amount: `${formatDecimal(Math.abs(diff), 1)}%`,
    direction: diff > 0 ? "up" : "down",
  };
}
