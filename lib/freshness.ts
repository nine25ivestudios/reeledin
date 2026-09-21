const FRESH_HOURS = 6;
const STALE_HOURS = 7 * 24;

export function roundToHour(date: Date): Date {
  const rounded = new Date(date);
  rounded.setUTCMinutes(0, 0, 0);
  rounded.setUTCMilliseconds(0);
  return rounded;
}

export function hoursSinceSync(
  lastSyncedAt: Date | string | null | undefined,
  now = new Date(),
): number | null {
  if (!lastSyncedAt) return null;
  const then = typeof lastSyncedAt === "string" ? new Date(lastSyncedAt) : lastSyncedAt;
  if (Number.isNaN(then.getTime())) return null;
  return (roundToHour(now).getTime() - roundToHour(then).getTime()) / 3_600_000;
}

/** sweep 0–1 (how much of the ring is the gradient), fade 0–1 (saturation). */
export function freshnessVars(
  lastSyncedAt: Date | string | null | undefined,
  now = new Date(),
): { sweep: number; fade: number } {
  const hours = hoursSinceSync(lastSyncedAt, now);
  if (hours === null) return { sweep: 0, fade: 0 };
  if (hours < FRESH_HOURS) return { sweep: 1, fade: 1 };
  if (hours >= STALE_HOURS) return { sweep: 0, fade: 0 };
  const t = (hours - FRESH_HOURS) / (STALE_HOURS - FRESH_HOURS);
  const remaining = Math.max(0, Math.min(1, 1 - t));
  return { sweep: remaining, fade: remaining };
}
