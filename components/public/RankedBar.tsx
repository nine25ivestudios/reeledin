import type { ReactNode } from "react";
import { formatShare } from "@/lib/format";

export function RankedBar({ label, share, color }: { label: ReactNode; share: number; color: string }) {
  return (
    <div className="grid grid-cols-[minmax(0,9rem)_1fr_3rem] items-center gap-3 text-sm sm:grid-cols-[minmax(0,11rem)_1fr_3rem]">
      <span className="text-muted-foreground">{label}</span>
      <div className="h-2 overflow-hidden rounded-full bg-border">
        <div className="h-full rounded-full" style={{ width: `${Math.min(100, share * 100)}%`, background: color }} />
      </div>
      <span className="text-right font-display font-semibold tabular-nums text-foreground">{formatShare(share)}</span>
    </div>
  );
}
