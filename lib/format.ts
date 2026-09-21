import { hoursSinceSync } from "./freshness";

export function formatInteger(value: number): string {
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(value);
}

export function formatDecimal(value: number, digits = 1): string {
  return new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
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

export function formatChartDay(date: Date): string {
  return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short" }).format(date);
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
