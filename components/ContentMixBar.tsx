import { formatShare } from "@/lib/format";
import { computeContentMix, type RecentPost } from "@/lib/instagram";

export function ContentMixBar({ posts }: { posts: RecentPost[] }) {
  if (posts.length === 0) return null;
  const mix = computeContentMix(posts);
  const rows = [
    { label: "Photo", share: mix.image },
    { label: "Reel / video", share: mix.video },
    { label: "Carousel", share: mix.carousel },
  ];

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <h2 className="font-display text-lg font-semibold text-foreground">Content mix</h2>
      <p className="mt-1 text-xs text-muted-foreground">Share of recent posts by type.</p>
      <div className="mt-4 space-y-2">
        {rows.map((row) => (
          <div key={row.label} className="grid grid-cols-[7rem_1fr_3rem] items-center gap-2 text-sm">
            <span className="truncate text-muted-foreground">{row.label}</span>
            <div className="h-2 overflow-hidden rounded-full bg-border">
              <div className="h-full rounded-full bg-verified" style={{ width: `${Math.min(100, row.share * 100)}%` }} />
            </div>
            <span className="text-right tabular-nums text-foreground">{formatShare(row.share)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
