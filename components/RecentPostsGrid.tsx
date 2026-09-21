import { formatInteger } from "@/lib/format";
import type { RecentPost } from "@/lib/instagram";

function typeLabel(type: string) {
  const t = type.toUpperCase();
  if (t === "VIDEO" || t === "REELS" || t === "REEL") return "Reel";
  if (t === "CAROUSEL_ALBUM") return "Carousel";
  return "Photo";
}

function PostThumb({ post }: { post: RecentPost }) {
  const inner = post.thumbnailUrl ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={post.thumbnailUrl} alt="" className="h-full w-full object-cover" />
  ) : (
    <span className="flex h-full w-full items-center justify-center bg-background text-xs text-muted-foreground">
      {typeLabel(post.mediaType)}
    </span>
  );

  const body = (
    <div className="relative aspect-square overflow-hidden rounded-xl bg-background">
      {inner}
      <div className="absolute inset-x-0 bottom-0 flex justify-between bg-black/55 px-2 py-1 text-[10px] tabular-nums text-white">
        <span>{formatInteger(post.likeCount)} likes</span>
        <span>{formatInteger(post.commentsCount)}</span>
      </div>
    </div>
  );

  if (!post.permalink) return body;
  return (
    <a href={post.permalink} target="_blank" rel="noreferrer" className="block">
      {body}
    </a>
  );
}

export function RecentPostsGrid({ posts }: { posts: RecentPost[] }) {
  if (posts.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card p-5">
        <h2 className="font-display text-lg font-semibold text-foreground">Recent posts</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          No posts returned on this sync. Publish on Instagram, then use Sync now.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <h2 className="font-display text-lg font-semibold text-foreground">Recent posts</h2>
      <p className="mt-1 text-xs text-muted-foreground">From Instagram. Tap a tile to open the post.</p>
      <div className="mt-4 grid grid-cols-3 gap-2">
        {posts.map((post, index) => (
          <PostThumb key={post.permalink ?? `${post.mediaType}-${index}`} post={post} />
        ))}
      </div>
    </div>
  );
}
