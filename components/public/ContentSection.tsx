import { detectThemes, pickTopPost, postTitle } from "@/lib/content";
import { AFTER_NEXT_SYNC, formatInteger, formatPostDate } from "@/lib/format";
import type { RecentPost } from "@/lib/instagram";
import { PlayPlaceholder, PostThumb } from "./PostThumb";

function TopPostCard({ posts }: { posts: RecentPost[] }) {
  const top = pickTopPost(posts);

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
                {top.playCount === null ? "—" : formatInteger(Math.round(top.playCount))}
              </p>
              <p className="mt-2 text-xs text-muted-foreground">{top.playCount === null ? `Views ${AFTER_NEXT_SYNC.toLowerCase()}` : "views"}</p>
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
              <a
                href={top.permalink}
                target="_blank"
                rel="noreferrer"
                className="mt-auto pt-5 text-sm text-verified hover:underline"
              >
                Open on Instagram
              </a>
            ) : null}
          </div>
        </div>
      )}
    </section>
  );
}

function ThemesCard({ posts }: { posts: RecentPost[] }) {
  const themes = detectThemes(posts);
  const captionsSynced = posts.some((p) => p.caption !== null);

  return (
    <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
      <h2 className="font-display text-lg font-semibold text-foreground">Content themes</h2>
      <p className="mt-1 text-xs text-muted-foreground">Detected from recent captions.</p>
      {themes.length > 0 ? (
        <ul className="mt-5 flex flex-wrap gap-2">
          {themes.map((theme) => (
            <li
              key={theme.label}
              className="rounded-full border border-border bg-background px-3 py-1 text-sm text-foreground"
            >
              {theme.label}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-5 text-sm text-muted-foreground">
          {posts.length === 0
            ? "No content synced yet."
            : captionsSynced
              ? "No recurring topics in recent captions yet."
              : AFTER_NEXT_SYNC}
        </p>
      )}
    </section>
  );
}

export function ContentSection({ posts }: { posts: RecentPost[] }) {
  return (
    <div className="grid gap-3 md:grid-cols-[1.6fr_1fr]">
      <TopPostCard posts={posts} />
      <ThemesCard posts={posts} />
    </div>
  );
}
