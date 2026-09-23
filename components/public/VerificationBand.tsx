import { VerifiedCheck } from "@/components/BrandMark";
import { LocalTime } from "./LocalTime";

export function VerificationBand({ lastSyncedAt }: { lastSyncedAt: Date | null }) {
  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-border bg-card px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <p className="inline-flex items-center gap-2.5 text-sm font-medium text-foreground">
        <VerifiedCheck className="h-5 w-5 shrink-0" />
        Verified directly from Instagram. No manual uploads.
      </p>
      <div className="text-sm sm:text-right">
        <p className="text-foreground">
          {lastSyncedAt ? (
            <>
              Last synced{" "}
              <span className="tabular-nums">
                <LocalTime iso={lastSyncedAt.toISOString()} />
              </span>
            </>
          ) : (
            "Not synced yet"
          )}
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">Some metrics require additional history</p>
      </div>
    </section>
  );
}
