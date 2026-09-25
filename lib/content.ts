import { formatPostDate } from "./format";
import { isReelMedia, type RecentPost } from "./instagram";

/** Ranks by views when Instagram returned them for any post; otherwise by likes + comments. */
export function pickTopPost(posts: RecentPost[]): RecentPost | null {
  if (posts.length === 0) return null;
  const byViews = posts.some((p) => p.playCount !== null);
  const score = (p: RecentPost) => (byViews ? p.playCount ?? -1 : p.likeCount + p.commentsCount);
  return posts.reduce((best, p) => (score(p) > score(best) ? p : best));
}

export function postTitle(post: RecentPost): string {
  const firstLine = post.caption
    ?.split("\n")
    .map((line) => line.replace(/#[\p{L}\p{N}_]+/gu, "").trim())
    .find(Boolean);
  if (firstLine) return firstLine.length > 90 ? `${firstLine.slice(0, 87).trimEnd()}…` : firstLine;
  const kind = isReelMedia(post) ? "Reel" : post.mediaType.toUpperCase() === "CAROUSEL_ALBUM" ? "Carousel" : "Post";
  const date = formatPostDate(post.timestamp);
  return date ? `${kind} from ${date}` : kind;
}
