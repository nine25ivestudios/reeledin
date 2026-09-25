import { pickTopPost, postTitle } from "@/lib/content";
import { AFTER_NEXT_SYNC, compactNumber, formatInteger, formatPostDate } from "@/lib/format";
import type { RecentPost } from "@/lib/instagram";
import { PlayPlaceholder, PostThumb } from "./PostThumb";

export function ContentSection({ posts }: { posts: RecentPost[] }) {
  const top = pickTopPost(posts);
  const views = top && top.playCount !== null ? compactNumber(Math.round(top.playCount)) : null;

  return (
    <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
      <h2 className="font-display text-lg font-semibold text-foreground">Top performing content</h2>
      {!top ? (
        <div className="mt-5 aspect-[16/9] overflow-hidden rounded-xl">
          <PlayPlaceholder label="No content synced yet" />
        </div>
      ) : (
        <div className="mt-5 grid gap-5 sm:grid-cols-[minmax(0,220px)_1fr]">
          <div className="aspect-square w-full max-w-[280px] overflow-hidden rounded-xl bg-background sm:max-w-none">
            <PostThumb src={top.thumbnailUrl} />
          </div>
          <div className="flex min-w-0 flex-col">
            <p className="font-display text-lg font-semibold leading-snug text-foreground">{postTitle(top)}</p>
            <div className="mt-4">
              <p className="font-display text-4xl font-semibold tabular-nums leading-none text-foreground">
                {views ? views.short : "—"}
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                {views ? (
                  <>
                    {views.exact ? <span className="tabular-nums">{views.exact} </span> : null}
                    views
                  </>
                ) : (
                  `Views ${AFTER_NEXT_SYNC.toLowerCase()}`
                )}
              </p>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              <span className="font-display tabular-nums text-foreground">{formatInteger(top.likeCount)}</span> likes
              <span className="mx-1.5 text-border">·</span>
              <span className="font-display tabular-nums text-foreground">{formatInteger(top.commentsCount)}</span> comments
              {top.timestamp ? (
                <>
                  <span className="mx-1.5 text-border">·</span>
                  {formatPostDate(top.timestamp)}
                </>
              ) : null}
            </p>
            {top.permalink ? (
              <a href={top.permalink} target="_blank" rel="noreferrer" className="link-tertiary mt-auto self-start pt-5">
                Open on Instagram
              </a>
            ) : null}
          </div>
        </div>
      )}
    </section>
  );
}
