import type { StatDelta } from "@/lib/format";

function deltaClass(delta: StatDelta | null | undefined) {
  if (!delta || delta.direction === "flat") return "text-muted-foreground";
  return delta.direction === "up" ? "text-success" : "text-destructive";
}

export type StatBarItem = {
  label: string;
  value: string | null;
  featured?: boolean;
  muted?: boolean;
  tag?: string;
  emptyCaption?: string;
  delta?: StatDelta | null;
};

export function StatBar({
  items,
  columnsClassName = "lg:grid-cols-4",
}: {
  items: StatBarItem[];
  columnsClassName?: string;
}) {
  return (
    <div className={`grid grid-cols-2 overflow-hidden rounded-2xl border border-border bg-card ${columnsClassName}`}>
      {items.map((item, index) => {
        const empty = item.value === null;
        return (
          <div
            key={item.label}
            className={`px-4 py-4 sm:px-5 ${index % 2 === 1 ? "border-l border-border" : ""} ${
              index >= 2 ? "border-t border-border" : ""
            } lg:border-t-0 ${index === 0 ? "lg:border-l-0" : "lg:border-l"}`}
            style={
              item.featured
                ? { background: "linear-gradient(135deg, rgba(0,149,246,0.12), rgba(0,149,246,0.02) 55%, transparent)" }
                : undefined
            }
          >
            <p className="text-xs uppercase tracking-wide text-muted-foreground">{item.label}</p>
            <p
              className={`mt-1 font-display font-semibold tabular-nums leading-none ${
                item.featured ? "text-5xl sm:text-6xl" : "text-xl sm:text-2xl"
              } ${item.muted || empty ? "text-muted-foreground" : "text-foreground"}`}
            >
              {item.value ?? "—"}
            </p>
            {empty && item.emptyCaption ? (
              <p className="mt-2 text-[11px] font-medium text-muted-foreground">{item.emptyCaption}</p>
            ) : null}
            {!empty && item.delta ? (
              <p className={`mt-2 text-xs font-medium ${deltaClass(item.delta)}`}>{item.delta.amount}</p>
            ) : null}
            {item.tag ? <p className="mt-1 text-[11px] font-medium text-muted-foreground">{item.tag}</p> : null}
          </div>
        );
      })}
    </div>
  );
}
