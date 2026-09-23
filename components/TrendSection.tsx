import {
  AFTER_NEXT_SYNC,
  formatChartDay,
  formatInteger,
  formatPercent,
  relativePercentDelta,
  snapshotClosestToDaysAgo,
  type StatDelta,
} from "@/lib/format";
import type { TrendPoint } from "@/lib/data";

type SeriesPoint = { takenAt: Date; value: number };

function dayKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function xForTime(points: SeriesPoint[], index: number, padLeft: number, innerW: number): number {
  if (points.length === 1) return padLeft + innerW / 2;
  const t0 = points[0].takenAt.getTime();
  const t1 = points[points.length - 1].takenAt.getTime();
  const span = Math.max(1, t1 - t0);
  return padLeft + ((points[index].takenAt.getTime() - t0) / span) * innerW;
}

/** First / last unique calendar days, plus one interior unique day when it exists. */
function labelIndexes(points: SeriesPoint[]): number[] {
  const firstOfDay = new Map<string, number>();
  points.forEach((p, i) => {
    const key = dayKey(p.takenAt);
    if (!firstOfDay.has(key)) firstOfDay.set(key, i);
  });
  const unique = [...firstOfDay.values()];
  if (unique.length === 0) return [];
  if (unique.length === 1) return unique;
  if (unique.length === 2) return unique;
  const mid = unique[Math.floor(unique.length / 2)];
  return [unique[0], mid, unique[unique.length - 1]];
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

  const width = 480;
  const height = 168;
  const pad = { top: 10, right: 10, bottom: 26, left: 8 };
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;
  const values = points.map((p) => p.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const flat = max - min < 0.0001;
  const yMin = flat ? min - 1 : min;
  const yMax = flat ? max + 1 : max;
  const span = yMax - yMin;

  function x(i: number) {
    return xForTime(points, i, pad.left, innerW);
  }
  function y(v: number) {
    return pad.top + (1 - (v - yMin) / span) * innerH;
  }

  const last = points.length - 1;
  const line = points.map((p, i) => `${i === 0 ? "M" : "L"} ${x(i)} ${y(p.value)}`).join(" ");
  const area = `${line} L ${x(last)} ${height - pad.bottom} L ${x(0)} ${height - pad.bottom} Z`;
  const lineTop = Math.min(...points.map((p) => y(p.value)));
  const plotBottom = height - pad.bottom;
  const gridYs = [0, 0.33, 0.66, 1].map((t) => pad.top + t * innerH);
  const labels = labelIndexes(points);

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="mt-3 h-[168px] w-full"
      role="img"
      aria-label={ariaLabel}
    >
      <defs>
        <linearGradient
          id={gradientId}
          gradientUnits="userSpaceOnUse"
          x1="0"
          y1={lineTop}
          x2="0"
          y2={plotBottom}
        >
          <stop offset="0%" stopColor={color} stopOpacity="0.28" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {gridYs.map((gy) => (
        <line
          key={gy}
          x1={pad.left}
          x2={width - pad.right}
          y1={gy}
          y2={gy}
          stroke="var(--border)"
          strokeOpacity="0.55"
          strokeWidth="1"
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
        pathLength={1}
      />
      <circle cx={x(last)} cy={y(points[last].value)} r="4.5" fill={color} />
      {labels.map((i) => (
        <text
          key={`${dayKey(points[i].takenAt)}-${i}`}
          x={x(i)}
          y={height - 6}
          textAnchor={i === 0 ? "start" : i === last ? "end" : "middle"}
          fill="var(--muted-foreground)"
          fontSize="10"
        >
          {formatChartDay(points[i].takenAt)}
        </text>
      ))}
    </svg>
  );
}

function weekDelta(points: SeriesPoint[]): StatDelta | null {
  if (points.length === 0) return null;
  const current = points[points.length - 1];
  const baseline = snapshotClosestToDaysAgo(points, 7);
  return relativePercentDelta(current.value, baseline?.value, "vs last week");
}

function ChartPanel({
  title,
  value,
  points,
  color,
  gradientId,
  ariaLabel,
}: {
  title: string;
  value: string | null;
  points: SeriesPoint[];
  color: string;
  gradientId: string;
  ariaLabel: string;
}) {
  const delta = weekDelta(points);
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
      {value === null ? (
        <p className="mt-1 text-[11px] font-medium text-muted-foreground">{AFTER_NEXT_SYNC}</p>
      ) : delta ? (
        <p className={`mt-1 text-xs font-medium ${deltaClass}`}>{delta.amount}</p>
      ) : null}
      <LineChart points={points} ariaLabel={ariaLabel} color={color} gradientId={gradientId} />
    </section>
  );
}

export function TrendSection({
  history,
  currentReach,
  currentEngagement,
}: {
  history: TrendPoint[];
  currentReach: number | null;
  currentEngagement: number;
}) {
  const reachPoints = history
    .filter((row) => row.reach !== null)
    .map((row) => ({ takenAt: row.takenAt, value: row.reach as number }));
  const engagementPoints = history.map((row) => ({ takenAt: row.takenAt, value: row.engagementRate }));

  return (
    <div className="grid gap-3 lg:grid-cols-2">
      <ChartPanel
        title="Reach"
        value={currentReach === null ? null : formatInteger(currentReach)}
        points={reachPoints}
        color="#0095F6"
        gradientId="trend-reach-fill"
        ariaLabel="Reach over time"
      />
      <ChartPanel
        title="Engagement"
        value={formatPercent(currentEngagement)}
        points={engagementPoints}
        color="#8B7CF8"
        gradientId="trend-engagement-fill"
        ariaLabel="Engagement rate over time"
      />
    </div>
  );
}
