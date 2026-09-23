"use client";

import { useMemo, useState } from "react";
import { formatInteger, formatPostDate } from "@/lib/format";
import type { RecentPost } from "@/lib/instagram";

const WINDOW_OPTIONS = [6, 9, 12] as const;

function PlayIcon() {
  return (
    <svg viewBox="0 0 16 16" className="h-3 w-3" fill="currentColor" aria-hidden="true">
      <path d="M5 3.5v9l8-4.5-8-4.5Z" />
    </svg>
  );
}

function postScore(post: RecentPost) {
  return (post.playCount ?? 0) * 1_000 + post.likeCount + post.commentsCount;
}

function Thumb({
  post,
  featured = false,
}: {
  post: RecentPost;
  featured?: boolean;
}) {
  const inner = post.thumbnailUrl ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={post.thumbnailUrl} alt="" className="h-full w-full object-cover" />
  ) : (
    <span className="flex h-full w-full items-center justify-center bg-background text-xs text-muted-foreground">
      Post
    </span>
  );

  const frame = (
    <div className={`relative overflow-hidden rounded-xl bg-background ${featured ? "aspect-[4/5] sm:aspect-square" : "aspect-square"}`}>
      {inner}
      {featured ? (
        <span className="absolute left-2 top-2 rounded-full bg-black/75 px-2 py-0.5 text-[11px] font-medium text-white">
          Top post
        </span>
      ) : null}
      {post.playCount !== null ? (
        <span className="absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-full bg-black/70 px-2 py-0.5 text-[11px] tabular-nums text-white">
          <PlayIcon />
          {formatInteger(Math.round(post.playCount))}
        </span>
      ) : null}
    </div>
  );

  const meta = (
    <div className="mt-2 space-y-0.5 text-xs text-muted-foreground">
      <p>
        <span className="font-display tabular-nums text-foreground">{formatInteger(post.likeCount)}</span> likes
        <span className="mx-1.5 text-border">·</span>
        <span className="font-display tabular-nums text-foreground">{formatInteger(post.commentsCount)}</span>{" "}
        comments
      </p>
      {post.timestamp ? <p>{formatPostDate(post.timestamp)}</p> : null}
    </div>
  );

  const body = (
    <>
      {frame}
      {meta}
    </>
  );

  if (!post.permalink) return <div className="min-w-0">{body}</div>;
  return (
    <a href={post.permalink} target="_blank" rel="noreferrer" className="min-w-0 block">
      {body}
    </a>
  );
}

export function RecentPostsGrid({
  posts,
  username,
}: {
  posts: RecentPost[];
  username: string;
}) {
  const [windowSize, setWindowSize] = useState<(typeof WINDOW_OPTIONS)[number]>(6);
  const shown = useMemo(() => {
    const slice = posts.slice(0, windowSize);
    if (slice.length <= 1) return slice;
    const ranked = [...slice].sort((a, b) => postScore(b) - postScore(a));
    const top = ranked[0];
    const rest = slice.filter((p) => p !== top);
    return [top, ...rest];
  }, [posts, windowSize]);

  if (posts.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card p-5">
        <h2 className="font-display text-lg font-semibold text-foreground">Top Performing Content</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          No posts returned on this sync. Publish on Instagram, then use Sync now.
        </p>
      </div>
    );
  }

  const [top, ...rest] = shown;

  return (
    <section className="rounded-2xl border border-border bg-card p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-lg font-semibold text-foreground">Top Performing Content</h2>
        <div className="flex items-center gap-3">
          <label className="text-xs text-muted-foreground">
            Last{" "}
            <select
              value={windowSize}
              onChange={(event) => setWindowSize(Number(event.target.value) as (typeof WINDOW_OPTIONS)[number])}
              className="ml-1 rounded-lg border border-border bg-background px-2 py-1 text-foreground"
            >
              {WINDOW_OPTIONS.map((n) => (
                <option key={n} value={n}>
                  {n} posts
                </option>
              ))}
            </select>
          </label>
          <a
            href={`https://www.instagram.com/${username}/`}
            target="_blank"
            rel="noreferrer"
            className="text-sm text-verified hover:underline"
          >
            View all
          </a>
        </div>
      </div>

      {rest.length === 0 ? (
        <div className="mx-auto w-full max-w-md">
          <Thumb post={top} featured />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="sm:col-span-2">
            <Thumb post={top} featured />
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-1">
            {rest.map((post, index) => (
              <Thumb key={post.permalink ?? `${post.mediaType}-${index}`} post={post} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
