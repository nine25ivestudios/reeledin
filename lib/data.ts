import { cookies } from "next/headers";
import { prisma } from "./prisma";
import { getSessionUserId } from "./session";
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

function mapAudience(audienceRow: {
  ageBrackets: string;
  genderSplit: string;
  topCities: string;
  topCountries: string;
  takenAt: Date;
} | null): AudienceView | null {
  if (!audienceRow) return null;
  return {
    ageBrackets: parseAgeBrackets(audienceRow.ageBrackets),
    genderSplit: parseGenderSplit(audienceRow.genderSplit),
    topCities: parsePlaces(audienceRow.topCities),
    topCountries: parsePlaces(audienceRow.topCountries),
    takenAt: audienceRow.takenAt,
  };
}

function computeDeltas(
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

export async function getDashboardData() {
  const userId = await getSessionUserId();
  if (!userId) return null;

  let user;
  try {
    user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        accounts: {
          include: {
            snapshots: { orderBy: { takenAt: "asc" } },
            audienceSnapshots: { orderBy: { takenAt: "desc" }, take: 1 },
          },
        },
      },
    });
  } catch (error) {
    throw new Error(
      error instanceof Error
        ? `Could not load dashboard from the database: ${error.message}`
        : "Could not load dashboard from the database.",
    );
  }

  if (!user) {
    cookies().delete("reeledin_session");
    return null;
  }

  const account = user.accounts.find((a) => a.platform === "instagram") ?? user.accounts[0] ?? null;
  const history = account?.snapshots ?? [];
  const snapshot = history.length > 0 ? history[history.length - 1] : null;
  const audience = mapAudience(account?.audienceSnapshots[0] ?? null);
  const recentPosts = snapshot ? parseRecentPosts(snapshot.recentPosts) : [];
  const deltas = computeDeltas(history);
  const trend: TrendPoint[] = history.map((row) => ({
    takenAt: row.takenAt,
    engagementRate: row.engagementRate,
    reach: row.reach,
  }));

  return {
    user,
    account,
    snapshot,
    history,
    audience,
    recentPosts,
    deltas,
    trend,
    avgReelViews: computeAvgReelViews(recentPosts),
    profile: user.profile,
  };
}

export async function getPublicCredential(slug: string) {
  const profile = await prisma.profile.findUnique({
    where: { slug: slug.toLowerCase() },
    include: {
      user: {
        include: {
          accounts: {
            include: {
              snapshots: { orderBy: { takenAt: "asc" } },
              audienceSnapshots: { orderBy: { takenAt: "desc" }, take: 1 },
            },
          },
        },
      },
    },
  });

  if (!profile || !profile.isPublic) return null;

  const account =
    profile.user.accounts.find((item) => item.platform === "instagram") ??
    profile.user.accounts[0];
  if (!account) return null;

  const history = account.snapshots;
  const snapshot = history.length > 0 ? history[history.length - 1] : null;
  if (!snapshot) return null;

  const audience = mapAudience(account.audienceSnapshots[0] ?? null);
  const recentPosts = parseRecentPosts(snapshot.recentPosts);
  const deltas = computeDeltas(history);
  const trend: TrendPoint[] = history.map((row) => ({
    takenAt: row.takenAt,
    engagementRate: row.engagementRate,
    reach: row.reach,
  }));

  return {
    profile,
    account,
    snapshot,
    history,
    audience,
    recentPosts,
    deltas,
    trend,
    avgReelViews: computeAvgReelViews(recentPosts),
  };
}
