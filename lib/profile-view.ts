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

export type TrendSeries = {
  points: Array<{ takenAt: Date; value: number }>;
  /** `daily`: one value per calendar day from DailyInsight. `sync`: one value per stored snapshot. */
  cadence: "daily" | "sync";
};

export type ProfileTrends = { reach: TrendSeries; engagement: TrendSeries };

export type DailyInsightRow = { date: Date; reach: number | null; engagementRate: number | null };

export const TREND_DAYS = 30;

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
  trends: ProfileTrends;
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

function dailyPoints(daily: DailyInsightRow[], pick: (row: DailyInsightRow) => number | null) {
  const rows = daily
    .map((row) => ({ takenAt: row.date, value: pick(row) }))
    .filter((row): row is { takenAt: Date; value: number } => row.value !== null)
    .sort((a, b) => a.takenAt.getTime() - b.takenAt.getTime());
  if (rows.length === 0) return rows;
  const cutoff = rows[rows.length - 1].takenAt.getTime() - (TREND_DAYS - 1) * 24 * 60 * 60 * 1000;
  return rows.filter((row) => row.takenAt.getTime() >= cutoff);
}

/** Daily history when at least two days exist, otherwise the per-sync snapshot line. */
function buildTrends(history: ProfileSnapshotRow[], daily: DailyInsightRow[]): ProfileTrends {
  function pick(
    fromDaily: (row: DailyInsightRow) => number | null,
    fromSnapshot: (row: ProfileSnapshotRow) => number | null,
  ): TrendSeries {
    const points = dailyPoints(daily, fromDaily);
    if (points.length >= 2) return { points, cadence: "daily" };
    return {
      cadence: "sync",
      points: history
        .map((row) => ({ takenAt: row.takenAt, value: fromSnapshot(row) }))
        .filter((row): row is { takenAt: Date; value: number } => row.value !== null),
    };
  }
  return {
    reach: pick((row) => row.reach, (row) => row.reach),
    engagement: pick((row) => row.engagementRate, (row) => row.engagementRate),
  };
}

/** The one path from stored snapshots to what the public profile and dashboard render. */
export function buildPublicProfileView(input: {
  slug: string;
  /** Instagram profile name and bio as last synced; null when Instagram returns none. */
  name: string | null;
  biography: string | null;
  username: string;
  profilePictureUrl: string | null;
  lastSyncedAt: Date | null;
  /** Oldest first; must contain at least one row. */
  history: ProfileSnapshotRow[];
  daily: DailyInsightRow[];
  audience: AudienceRow | null;
}): PublicProfileView {
  const { history } = input;
  const snapshot = history[history.length - 1];
  const recentPosts = parseRecentPosts(snapshot.recentPosts);
  return {
    slug: input.slug,
    displayName: input.name || input.username,
    bio: input.biography,
    username: input.username,
    profilePictureUrl: input.profilePictureUrl,
    lastSyncedAt: input.lastSyncedAt,
    followersCount: snapshot.followersCount,
    engagementRate: snapshot.engagementRate,
    postsAnalyzed: snapshot.postsAnalyzed,
    reach: snapshot.reach,
    avgReelViews: computeAvgReelViews(recentPosts),
    deltas: computeDeltas(history),
    trends: buildTrends(history, input.daily),
    audience: mapAudience(input.audience),
    recentPosts,
  };
}
