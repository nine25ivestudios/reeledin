type Props = {
  label: string;
  value: string;
  muted?: boolean;
  tag?: string;
  delta?: { amount: string; direction: "up" | "down" | "flat" } | null;
};

export function Stat({ label, value, muted = false, tag, delta }: Props) {
  return (
    <div className="rounded-2xl border border-border bg-card px-4 py-4">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p
        className={`mt-1 font-display text-3xl font-semibold tabular-nums ${
          muted ? "text-muted-foreground" : "text-foreground"
        }`}
      >
        {value}
        {delta && delta.direction !== "flat" ? (
          <span
            className={`ml-2 align-middle text-sm font-medium ${
              delta.direction === "up" ? "text-success" : "text-destructive"
            }`}
          >
            {delta.direction === "up" ? "↑" : "↓"} {delta.amount}
          </span>
        ) : null}
      </p>
      {tag ? <p className="mt-1 text-[11px] font-medium text-muted-foreground">{tag}</p> : null}
    </div>
  );
}
