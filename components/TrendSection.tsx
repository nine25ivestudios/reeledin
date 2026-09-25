import {
  AFTER_NEXT_SYNC,
  compactNumber,
  formatChartDay,
  formatPercent,
  relativePercentDelta,
  snapshotClosestToDaysAgo,
  type StatDelta,
} from "@/lib/format";
import type { ProfileTrends, TrendSeries } from "@/lib/data";

type SeriesPoint = TrendSeries["points"][number];

const DAY_MS = 86_400_000;

function dayKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/**
 * Evenly spaced dates across the range. Each tick carries the viewport classes that decide
 * how many show: 2 on phones, 3 from `sm`, 4 from `lg`. Start and end always show.
 */
const INNER_TICKS = [
  { at: 1 / 3, className: "hidden lg:block" },
  { at: 1 / 2, className: "hidden sm:block lg:hidden" },
  { at: 2 / 3, className: "hidden lg:block" },
] as const;

function axisTicks(t0: number, t1: number) {
  const ticks: Array<{ at: number; date: Date; className: string }> = [{ at: 0, date: new Date(t0), className: "" }];
  if (dayKey(new Date(t1)) !== dayKey(new Date(t0))) ticks.push({ at: 1, date: new Date(t1), className: "" });
  const seen = new Set(ticks.map((tick) => dayKey(tick.date)));
  for (const tick of INNER_TICKS) {
    const date = new Date(Math.round((t0 + (t1 - t0) * tick.at) / DAY_MS) * DAY_MS);
    const at = (date.getTime() - t0) / Math.max(1, t1 - t0);
    // Snapping to a whole day can drag a tick toward an end label on short ranges.
    if (seen.has(dayKey(date)) || at < 0.2 || at > 0.8) continue;
    seen.add(dayKey(date));
    ticks.push({ at, date, className: tick.className });
  }
  return ticks;
}

function LineChart({
  points,
  ariaLabel,
  color,
  gradientId,
}: {
  points: SeriesPoint[];
  ariaLabel: string;
  color: string;
  gradientId: string;
}) {
  if (points.length < 2) {
    return (
      <p className="mt-6 text-sm text-muted-foreground">
        Trend appears after two syncs. Use Sync now later to plot this line.
      </p>
    );
  }

  // Stretched horizontally to the panel width; strokes opt out of the stretch, and the dot and
  // labels are HTML so they keep their size at every width.
  const width = 480;
  const height = 142;
  const pad = { top: 10, bottom: 0 };
  const innerH = height - pad.top - pad.bottom;
  const values = points.map((p) => p.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const flat = max - min < 0.0001;
  const yMin = flat ? min - 1 : min;
  const yMax = flat ? max + 1 : max;
  const span = yMax - yMin;

  const t0 = points[0].takenAt.getTime();
  const t1 = points[points.length - 1].takenAt.getTime();
  const tSpan = Math.max(1, t1 - t0);
  const fx = (p: SeriesPoint) => (p.takenAt.getTime() - t0) / tSpan;
  const y = (v: number) => pad.top + (1 - (v - yMin) / span) * innerH;

  const last = points[points.length - 1];
  const line = points.map((p, i) => `${i === 0 ? "M" : "L"} ${fx(p) * width} ${y(p.value)}`).join(" ");
  const area = `${line} L ${width} ${height} L 0 ${height} Z`;
  const lineTop = Math.min(...points.map((p) => y(p.value)));
  const gridYs = [0, 0.33, 0.66, 1].map((t) => pad.top + t * innerH);

  return (
    <div className="relative mt-3" role="img" aria-label={ariaLabel}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        className="block h-[142px] w-full overflow-visible"
        aria-hidden
      >
        <defs>
          <linearGradient id={gradientId} gradientUnits="userSpaceOnUse" x1="0" y1={lineTop} x2="0" y2={height}>
            <stop offset="0%" stopColor={color} stopOpacity="0.28" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        {gridYs.map((gy) => (
          <line
            key={gy}
            x1={0}
            x2={width}
            y1={gy}
            y2={gy}
            stroke="var(--border)"
            strokeOpacity="0.55"
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
          />
        ))}
        <path d={area} fill={`url(#${gradientId})`} />
        <path
          d={line}
          className="chart-line"
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <span
        aria-hidden
        className="pointer-events-none absolute right-0 h-[9px] w-[9px] -translate-y-1/2 translate-x-1/2 rounded-full"
        style={{ top: y(last.value), backgroundColor: color }}
      />
      <div className="relative h-[26px] text-[11px] leading-none text-muted-foreground" aria-hidden>
        {axisTicks(t0, t1).map((tick) => (
          <span
            key={dayKey(tick.date)}
            className={`absolute bottom-[6px] whitespace-nowrap tabular-nums ${tick.className}`}
            style={
              tick.at === 0
                ? { left: 0 }
                : tick.at === 1
                  ? { right: 0 }
                  : { left: `${tick.at * 100}%`, transform: "translateX(-50%)" }
            }
          >
            {formatChartDay(tick.date)}
          </span>
        ))}
      </div>
    </div>
  );
}

function mean(points: SeriesPoint[]): number {
  return points.reduce((sum, p) => sum + p.value, 0) / points.length;
}

function seriesDelta(series: TrendSeries, kind: "level" | "flow"): StatDelta | null {
  const { points } = series;
  if (points.length === 0) return null;
  if (series.cadence === "sync") {
    const baseline = snapshotClosestToDaysAgo(points, 7);
    return relativePercentDelta(points[points.length - 1].value, baseline?.value, "vs last week");
  }
  // Daily reach is a per-day flow, so compare the last 7 days with the 7 before them.
  if (kind === "flow") {
    if (points.length < 14) return null;
    return relativePercentDelta(mean(points.slice(-7)), mean(points.slice(-14, -7)), "vs previous 7 days");
  }
  const current = points[points.length - 1];
  const target = current.takenAt.getTime() - 7 * DAY_MS;
  const baseline = points.find((p) => dayKey(p.takenAt) === dayKey(new Date(target)));
  return relativePercentDelta(current.value, baseline?.value, "vs last week");
}

function ChartPanel({
  title,
  value,
  exact,
  series,
  kind,
  caption,
  color,
  gradientId,
  ariaLabel,
}: {
  title: string;
  value: string | null;
  exact?: string | null;
  series: TrendSeries;
  kind: "level" | "flow";
  caption: string;
  color: string;
  gradientId: string;
  ariaLabel: string;
}) {
  const delta = seriesDelta(series, kind);
  const deltaClass =
    !delta || delta.direction === "flat"
      ? "text-muted-foreground"
      : delta.direction === "up"
        ? "text-success"
        : "text-destructive";

  return (
    <section className="rounded-2xl border border-border bg-card p-5">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{title}</p>
      <p
        className={`mt-1 font-display text-2xl font-semibold tabular-nums ${
          value === null ? "text-muted-foreground" : "text-foreground"
        }`}
      >
        {value ?? "—"}
      </p>
      {value !== null && exact ? <p className="text-xs tabular-nums text-muted-foreground">{exact}</p> : null}
      {value === null ? (
        <p className="mt-1 text-[11px] font-medium text-muted-foreground">{AFTER_NEXT_SYNC}</p>
      ) : delta ? (
        <p className={`mt-1 text-xs font-medium ${deltaClass}`}>{delta.amount}</p>
      ) : null}
      <LineChart points={series.points} ariaLabel={ariaLabel} color={color} gradientId={gradientId} />
      {series.points.length >= 2 ? <p className="text-[11px] leading-snug text-muted-foreground">{caption}</p> : null}
    </section>
  );
}

export function TrendSection({
  trends,
  currentReach,
  currentEngagement,
}: {
  trends: ProfileTrends;
  currentReach: number | null;
  currentEngagement: number;
}) {
  const reach = currentReach === null ? null : compactNumber(currentReach);
  const dailyReach = trends.reach.cadence === "daily";
  const dailyEngagement = trends.engagement.cadence === "daily";

  return (
    <div className="grid gap-3 lg:grid-cols-2">
      <ChartPanel
        title="Reach"
        value={reach?.short ?? null}
        exact={reach?.exact}
        series={trends.reach}
        kind={dailyReach ? "flow" : "level"}
        caption={
          dailyReach
            ? "Headline: last 28 days. Line: accounts reached each day, from Instagram Insights."
            : "Line: 28-day reach recorded at each sync."
        }
        color="#0095F6"
        gradientId="trend-reach-fill"
        ariaLabel={dailyReach ? "Daily reach, last 30 days" : "Reach at each sync"}
      />
      <ChartPanel
        title="Engagement"
        value={formatPercent(currentEngagement)}
        series={trends.engagement}
        kind="level"
        caption={
          dailyEngagement
            ? "ReeledIn calculation. Each day uses the 12 posts published by then, with current like and comment counts."
            : "ReeledIn calculation at each sync, from likes and comments on the 12 latest posts."
        }
        color="#8B7CF8"
        gradientId="trend-engagement-fill"
        ariaLabel={dailyEngagement ? "Engagement rate by day, last 30 days" : "Engagement rate at each sync"}
      />
    </div>
  );
}
