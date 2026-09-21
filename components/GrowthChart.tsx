import { formatChartDay, formatInteger, formatPercent } from "@/lib/format";

type Point = {
  takenAt: Date;
  followersCount: number;
  engagementRate: number;
};

export function GrowthChart({ history }: { history: Point[] }) {
  if (history.length < 2) {
    return (
      <p className="text-sm text-muted-foreground">
        Growth appears after two syncs. Use Sync now later to plot followers and engagement over time.
      </p>
    );
  }

  const width = 640;
  const height = 220;
  const pad = { top: 16, right: 16, bottom: 32, left: 48 };
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;

  const followers = history.map((p) => p.followersCount);
  const engagement = history.map((p) => p.engagementRate);
  const minF = Math.min(...followers);
  const maxF = Math.max(...followers);
  const minE = Math.min(...engagement);
  const maxE = Math.max(...engagement);
  const spanF = Math.max(1, maxF - minF);
  const spanE = Math.max(0.1, maxE - minE);

  function x(i: number) {
    return pad.left + (history.length === 1 ? innerW / 2 : (i / (history.length - 1)) * innerW);
  }
  function yF(v: number) {
    return pad.top + (1 - (v - minF) / spanF) * innerH;
  }
  function yE(v: number) {
    return pad.top + (1 - (v - minE) / spanE) * innerH;
  }

  const followLine = history.map((p, i) => `${i === 0 ? "M" : "L"} ${x(i)} ${yF(p.followersCount)}`).join(" ");
  const engageLine = history.map((p, i) => `${i === 0 ? "M" : "L"} ${x(i)} ${yE(p.engagementRate)}`).join(" ");

  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-4 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-2">
          <span className="h-0.5 w-4 bg-primary" /> Followers
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="h-0.5 w-4 bg-verified" /> Engagement
        </span>
      </div>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-auto w-full"
        role="img"
        aria-label="Follower count and engagement rate over time"
      >
        <line
          x1={pad.left}
          x2={width - pad.right}
          y1={height - pad.bottom}
          y2={height - pad.bottom}
          stroke="var(--border)"
        />
        <line
          x1={pad.left}
          x2={pad.left}
          y1={pad.top}
          y2={height - pad.bottom}
          stroke="var(--border)"
        />
        <path d={followLine} fill="none" stroke="var(--primary)" strokeWidth="2" />
        <path d={engageLine} fill="none" stroke="var(--verified)" strokeWidth="2" strokeDasharray="4 4" />
        {history.map((p, i) => (
          <g key={p.takenAt.toISOString() + i}>
            <circle cx={x(i)} cy={yF(p.followersCount)} r="3" fill="var(--primary)" />
            <text
              x={x(i)}
              y={height - 10}
              textAnchor="middle"
              fill="var(--muted-foreground)"
              fontSize="10"
            >
              {formatChartDay(p.takenAt)}
            </text>
          </g>
        ))}
        <text x={4} y={pad.top + 4} fill="var(--muted-foreground)" fontSize="10">
          {formatInteger(maxF)}
        </text>
        <text x={4} y={height - pad.bottom} fill="var(--muted-foreground)" fontSize="10">
          {formatInteger(minF)}
        </text>
      </svg>
      <p className="mt-2 text-xs text-muted-foreground">
        Latest engagement {formatPercent(history[history.length - 1].engagementRate)} · dashed line uses its own scale
      </p>
    </div>
  );
}
