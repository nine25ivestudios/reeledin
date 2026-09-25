import { relativePercentDelta, snapshotClosestToDaysAgo, type StatDelta } from "./format";
import { computeAvgReelViews, type PlaceShare, type RecentPost } from "./instagram";

export type AgeBrackets = Record<string, number>;
export type GenderSplit = { female: number; male: number; undisclosed: number };

export type AudienceView = {
  ageBrackets: AgeBrackets;
  genderSplit: GenderSplit;
  topCities: PlaceShare[];
  topCountries: PlaceShare[];
  takenAt: Date;
};

export type TrendPoint = {
  takenAt: Date;
  engagementRate: number;
  reach: number | null;
};

export type CredentialDeltas = {
  followers: StatDelta | null;
  engagementRate: StatDelta | null;
  avgReelViews: StatDelta | null;
  monthlyReach: StatDelta | null;
};

/** Stored audience row shape (JSON columns as strings). */
export type AudienceRow = {
  ageBrackets: string;
  genderSplit: string;
  topCities: string;
  topCountries: string;
  takenAt: Date;
};

/** Minimal snapshot shape the public profile needs; real rows and demo rows both satisfy it. */
export type ProfileSnapshotRow = {
  takenAt: Date;
  followersCount: number;
  engagementRate: number;
  postsAnalyzed: number;
  reach: number | null;
  recentPosts: string;
};

export type PublicProfileView = {
  slug: string;
  displayName: string;
  bio: string | null;
  username: string;
  profilePictureUrl: string | null;
  lastSyncedAt: Date | null;
  followersCount: number;
  engagementRate: number;
  postsAnalyzed: number;
  reach: number | null;
  avgReelViews: number | null;
  deltas: CredentialDeltas;
  trend: TrendPoint[];
  audience: AudienceView | null;
  recentPosts: RecentPost[];
};

function parseJson(value: unknown): unknown {
  if (typeof value === "string") {
    try {
      return JSON.parse(value) as unknown;
    } catch {
      return null;
    }
  }
  return value;
}

export function parseAgeBrackets(value: unknown): AgeBrackets {
  const parsed = parseJson(value);
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
  const out: AgeBrackets = {};
  for (const [key, raw] of Object.entries(parsed as Record<string, unknown>)) {
    const n = Number(raw);
    if (!Number.isNaN(n)) out[key] = n;
  }
  return out;
}

export function parseGenderSplit(value: unknown): GenderSplit {
  const parsed = parseJson(value);
  const rec = parsed && typeof parsed === "object" && !Array.isArray(parsed) ? (parsed as Record<string, unknown>) : {};
  return {
    female: Number(rec.female ?? 0) || 0,
    male: Number(rec.male ?? 0) || 0,
    undisclosed: Number(rec.undisclosed ?? 0) || 0,
  };
}

export function parsePlaces(value: unknown): PlaceShare[] {
  const parsed = parseJson(value);
  if (!Array.isArray(parsed)) return [];
  return parsed
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const rec = item as Record<string, unknown>;
      const name = String(rec.name ?? "");
      const share = Number(rec.share ?? 0);
      if (!name) return null;
      return { name, share };
    })
    .filter((item): item is PlaceShare => item !== null);
}

export function parseRecentPosts(value: unknown): RecentPost[] {
  const parsed = parseJson(value);
  if (!Array.isArray(parsed)) return [];
  const posts: RecentPost[] = [];
  for (const item of parsed) {
    if (!item || typeof item !== "object") continue;
    const rec = item as Record<string, unknown>;
    const playRaw = rec.playCount;
    const playCount =
      playRaw === null || playRaw === undefined || playRaw === "" ? null : Number(playRaw);
    posts.push({
      thumbnailUrl: rec.thumbnailUrl ? String(rec.thumbnailUrl) : null,
      permalink: rec.permalink ? String(rec.permalink) : null,
      mediaType: String(rec.mediaType ?? "IMAGE"),
      mediaProductType: rec.mediaProductType ? String(rec.mediaProductType) : null,
      likeCount: Number(rec.likeCount ?? 0) || 0,
      commentsCount: Number(rec.commentsCount ?? 0) || 0,
      timestamp: rec.timestamp ? String(rec.timestamp) : null,
      playCount: playCount !== null && Number.isFinite(playCount) ? playCount : null,
      caption: typeof rec.caption === "string" && rec.caption ? rec.caption : null,
    });
  }
  return posts;
}

export function mapAudience(audienceRow: AudienceRow | null): AudienceView | null {
  if (!audienceRow) return null;
  return {
    ageBrackets: parseAgeBrackets(audienceRow.ageBrackets),
    genderSplit: parseGenderSplit(audienceRow.genderSplit),
    topCities: parsePlaces(audienceRow.topCities),
    topCountries: parsePlaces(audienceRow.topCountries),
    takenAt: audienceRow.takenAt,
  };
}

export function computeDeltas(
  history: Array<{
    takenAt: Date;
    followersCount: number;
    engagementRate: number;
    reach: number | null;
    recentPosts: string;
  }>,
): CredentialDeltas {
  const empty: CredentialDeltas = {
    followers: null,
    engagementRate: null,
    avgReelViews: null,
    monthlyReach: null,
  };
  if (history.length === 0) return empty;
  const current = history[history.length - 1];
  const baseline = snapshotClosestToDaysAgo(history);
  if (!baseline) return empty;

  return {
    followers: relativePercentDelta(current.followersCount, baseline.followersCount),
    engagementRate: relativePercentDelta(current.engagementRate, baseline.engagementRate),
    avgReelViews: relativePercentDelta(
      computeAvgReelViews(parseRecentPosts(current.recentPosts)),
      computeAvgReelViews(parseRecentPosts(baseline.recentPosts)),
    ),
    monthlyReach: relativePercentDelta(current.reach, baseline.reach),
  };
}

/** The one path from stored snapshots to what the public profile renders. */
export function buildPublicProfileView(input: {
  slug: string;
  displayName: string;
  bio: string | null;
  username: string;
  profilePictureUrl: string | null;
  lastSyncedAt: Date | null;
  /** Oldest first; must contain at least one row. */
  history: ProfileSnapshotRow[];
  audience: AudienceRow | null;
}): PublicProfileView {
  const { history } = input;
  const snapshot = history[history.length - 1];
  const recentPosts = parseRecentPosts(snapshot.recentPosts);
  return {
    slug: input.slug,
    displayName: input.displayName,
    bio: input.bio,
    username: input.username,
    profilePictureUrl: input.profilePictureUrl,
    lastSyncedAt: input.lastSyncedAt,
    followersCount: snapshot.followersCount,
    engagementRate: snapshot.engagementRate,
    postsAnalyzed: snapshot.postsAnalyzed,
    reach: snapshot.reach,
    avgReelViews: computeAvgReelViews(recentPosts),
    deltas: computeDeltas(history),
    trend: history.map((row) => ({ takenAt: row.takenAt, engagementRate: row.engagementRate, reach: row.reach })),
    audience: mapAudience(input.audience),
    recentPosts,
  };
}
