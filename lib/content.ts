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

const STOPWORDS = new Set(
  (
    "about above after again against all also and any are because been before being below between both but " +
    "can could did does doing down during each even every few for from further had has have having here " +
    "how into its itself just like more most much must never only other ought our ours out over own same " +
    "should some such than that the their theirs them then there these they this those through too under " +
    "until very was were what when where which while who whom why will with would you your yours yourself " +
    "today tonight really thing things something always still back time made make makes making know dont " +
    "cant wont im ive youre thats its gonna wanna post posts link bio follow"
  ).split(" "),
);

export type ContentTheme = { label: string; kind: "hashtag" | "keyword" };

/**
 * Hashtags are the creator's own topic labels, so they rank first. Plain words only fill in
 * when they recur across at least two different captions — a single mention is not a theme.
 */
export function detectThemes(posts: RecentPost[], limit = 8): ContentTheme[] {
  const captions = posts.map((p) => p.caption).filter((c): c is string => Boolean(c));
  if (captions.length === 0) return [];

  const tagCounts = new Map<string, number>();
  const wordCounts = new Map<string, number>();
  captions.forEach((caption) => {
    const tags = new Set((caption.match(/#[\p{L}\p{N}_]+/gu) ?? []).map((t) => t.slice(1).toLowerCase()));
    tags.forEach((tag) => tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1));

    const words = new Set(
      caption
        .replace(/#[\p{L}\p{N}_]+/gu, " ")
        .replace(/https?:\/\/\S+|@[\w.]+/g, " ")
        .toLowerCase()
        .split(/[^\p{L}]+/u)
        .filter((w) => w.length >= 4 && !STOPWORDS.has(w)),
    );
    words.forEach((word) => wordCounts.set(word, (wordCounts.get(word) ?? 0) + 1));
  });

  const rank = (map: Map<string, number>) =>
    [...map.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));

  const themes: ContentTheme[] = rank(tagCounts)
    .slice(0, limit)
    .map(([tag]) => ({ label: `#${tag}`, kind: "hashtag" as const }));

  const seen = new Set(themes.map((t) => t.label.slice(1)));
  for (const [word, count] of rank(wordCounts)) {
    if (themes.length >= limit) break;
    if (count < 2 || seen.has(word)) continue;
    themes.push({ label: word, kind: "keyword" });
  }
  return themes;
}
