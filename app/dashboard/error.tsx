"use client";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="mx-auto max-w-xl px-5 py-16">
      <h1 className="font-display text-2xl font-semibold text-foreground">Dashboard did not load</h1>
      <p className="mt-3 text-sm text-destructive">{error.message}</p>
      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={reset}
          className="btn-primary px-4 py-2 text-sm"
        >
          Try again
        </button>
        <a href="/api/auth/instagram" className="rounded-lg border border-border px-4 py-2 text-sm">
          Connect Instagram
        </a>
      </div>
    </main>
  );
}
