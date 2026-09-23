import { getEnv } from "./env";

export const INSTAGRAM_SCOPES = [
  "instagram_business_basic",
  "instagram_business_manage_insights",
] as const;

export const AUDIENCE_MIN_FOLLOWERS = 100;
export const AUDIENCE_SYNC_INTERVAL_MS = 48 * 60 * 60 * 1000;

export class InstagramApiError extends Error {
  constructor(
    message: string,
    public status?: number,
  ) {
    super(message);
    this.name = "InstagramApiError";
  }
}

type TokenExchangeResponse =
  | {
      access_token?: string;
      user_id?: string | number;
      permissions?: string;
      data?: Array<{
        access_token?: string;
        user_id?: string | number;
        permissions?: string;
      }>;
      error?: string;
      error_message?: string;
      error_description?: string;
    }
  | {
      error_type?: string;
      code?: number;
      error_message?: string;
    };

type LongLivedResponse = {
  access_token?: string;
  token_type?: string;
  expires_in?: number;
  error?: { message?: string; type?: string };
};

export type InstagramProfile = {
  id: string;
  username: string;
  accountType: string;
  followersCount: number;
  mediaCount: number;
  name?: string;
  profilePictureUrl?: string | null;
};

export type IgMediaType = "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM" | string;

export type RecentPost = {
  thumbnailUrl: string | null;
  permalink: string | null;
  mediaType: IgMediaType;
  likeCount: number;
  commentsCount: number;
  timestamp: string | null;
  playCount: number | null;
  mediaProductType: string | null;
  caption: string | null;
};

const CAPTION_STORE_LIMIT = 600;

export type MediaEngagement = {
  likeCount: number;
  commentsCount: number;
  mediaType: IgMediaType;
};

export type PlaceShare = { name: string; share: number };

export type AudienceDemographics = {
  ageBrackets: Record<string, number>;
  genderSplit: { female: number; male: number; undisclosed: number };
  topCities: PlaceShare[];
  topCountries: PlaceShare[];
};

async function readJson<T>(res: Response, fallback: string): Promise<T> {
  const text = await res.text();
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new InstagramApiError(`${fallback} Instagram returned a non-JSON response.`, res.status);
  }
}

function graphErrorMessage(body: unknown, fallback: string): string {
  if (body && typeof body === "object") {
    const rec = body as Record<string, unknown>;
    const nested = rec.error;
    if (nested && typeof nested === "object") {
      const msg = (nested as { message?: string }).message;
      if (msg) return msg;
    }
    if (typeof rec.error_message === "string") return rec.error_message;
    if (typeof rec.error_description === "string") return rec.error_description;
    if (typeof rec.message === "string") return rec.message;
  }
  return fallback;
}

export function instagramAuthorizeUrl(state: string): string {
  const env = getEnv();
  const params = new URLSearchParams({
    client_id: env.instagramAppId,
    redirect_uri: env.instagramRedirectUri,
    response_type: "code",
    scope: INSTAGRAM_SCOPES.join(","),
    state,
    enable_fb_login: "0",
  });
  return `https://www.instagram.com/oauth/authorize?${params.toString()}`;
}

export async function exchangeCodeForShortLivedToken(code: string): Promise<{
  accessToken: string;
  userId: string;
}> {
  const env = getEnv();
  let res: Response;
  try {
    res = await fetch("https://api.instagram.com/oauth/access_token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: env.instagramAppId,
        client_secret: env.instagramAppSecret,
        grant_type: "authorization_code",
        redirect_uri: env.instagramRedirectUri,
        code,
      }),
    });
  } catch {
    throw new InstagramApiError(
      "Could not reach Instagram to exchange the authorization code. Check your network and try Connect Instagram again.",
    );
  }

  const body = await readJson<TokenExchangeResponse>(
    res,
    "Instagram rejected the token exchange.",
  );

  const row =
    "data" in body && Array.isArray(body.data) && body.data[0]
      ? body.data[0]
      : (body as { access_token?: string; user_id?: string | number });

  if (!res.ok || !row.access_token) {
    throw new InstagramApiError(
      graphErrorMessage(
        body,
        "Instagram did not return an access token. The authorization code may have expired — connect again.",
      ),
      res.status,
    );
  }

  return {
    accessToken: row.access_token,
    userId: String(row.user_id ?? ""),
  };
}

export async function exchangeForLongLivedToken(shortLivedToken: string): Promise<{
  accessToken: string;
  expiresIn: number;
}> {
  const env = getEnv();
  const params = new URLSearchParams({
    grant_type: "ig_exchange_token",
    client_secret: env.instagramAppSecret,
    access_token: shortLivedToken,
  });

  let res: Response;
  try {
    res = await fetch(`https://graph.instagram.com/access_token?${params.toString()}`);
  } catch {
    throw new InstagramApiError(
      "Could not reach Instagram to create a long-lived token. Try Connect Instagram again.",
    );
  }

  const body = await readJson<LongLivedResponse>(res, "Instagram rejected the long-lived token request.");
  if (!res.ok || !body.access_token || !body.expires_in) {
    throw new InstagramApiError(
      graphErrorMessage(body, "Instagram did not issue a 60-day token. Connect Instagram again."),
      res.status,
    );
  }

  return { accessToken: body.access_token, expiresIn: body.expires_in };
}

export async function refreshLongLivedToken(token: string): Promise<{
  accessToken: string;
  expiresIn: number;
}> {
  const params = new URLSearchParams({
    grant_type: "ig_refresh_token",
    access_token: token,
  });

  let res: Response;
  try {
    res = await fetch(`https://graph.instagram.com/refresh_access_token?${params.toString()}`);
  } catch {
    throw new InstagramApiError(
      "Could not reach Instagram to refresh your token. Use Sync now after your connection is stable.",
    );
  }

  const body = await readJson<LongLivedResponse>(res, "Instagram rejected the token refresh.");
  if (!res.ok || !body.access_token || !body.expires_in) {
    throw new InstagramApiError(
      graphErrorMessage(
        body,
        "Instagram could not refresh your token. Connect Instagram again to restore access.",
      ),
      res.status,
    );
  }

  return { accessToken: body.access_token, expiresIn: body.expires_in };
}

export async function fetchInstagramProfile(accessToken: string): Promise<InstagramProfile> {
  // Instagram Login /me fields: id, user_id, username, name, account_type,
  // profile_picture_url, followers_count, follows_count, media_count.
  // `category` is not on this path — do not request or invent niche tags.
  const params = new URLSearchParams({
    fields: "id,username,account_type,followers_count,media_count,name,profile_picture_url",
    access_token: accessToken,
  });

  let res: Response;
  try {
    res = await fetch(`https://graph.instagram.com/me?${params.toString()}`);
  } catch {
    throw new InstagramApiError("Could not reach Instagram to load your profile.");
  }

  const body = await readJson<{
    id?: string;
    username?: string;
    account_type?: string;
    followers_count?: number;
    media_count?: number;
    name?: string;
    profile_picture_url?: string;
    error?: { message?: string };
  }>(res, "Instagram rejected the profile request.");

  if (!res.ok || !body.id || !body.username) {
    throw new InstagramApiError(
      graphErrorMessage(body, "Instagram did not return a profile. Confirm this is a Business or Creator account."),
      res.status,
    );
  }

  const accountType = body.account_type ?? "UNKNOWN";
  if (accountType.toUpperCase() === "PERSONAL") {
    throw new InstagramApiError(
      "Instagram only shares stats for Business or Creator accounts. In Instagram, open Settings → Account type and switch, then connect again.",
    );
  }

  return {
    id: body.id,
    username: body.username,
    accountType,
    followersCount: body.followers_count ?? 0,
    mediaCount: body.media_count ?? 0,
    name: body.name,
    profilePictureUrl: body.profile_picture_url ?? null,
  };
}

type MediaRow = RecentPost & { id: string };

function insightNumeric(body: unknown): number | null {
  if (!body || typeof body !== "object") return null;
  const data = (body as { data?: unknown }).data;
  const first = Array.isArray(data) ? data[0] : null;
  if (!first || typeof first !== "object") return null;
  const rec = first as Record<string, unknown>;
  const total = rec.total_value;
  if (total && typeof total === "object") {
    const value = (total as { value?: unknown }).value;
    if (typeof value === "number" && Number.isFinite(value)) return value;
  }
  const values = rec.values;
  if (Array.isArray(values) && values[0] && typeof values[0] === "object") {
    const value = (values[0] as { value?: unknown }).value;
    if (typeof value === "number" && Number.isFinite(value)) return value;
  }
  return null;
}

export function isReelMedia(post: { mediaType: string; mediaProductType?: string | null }): boolean {
  const product = (post.mediaProductType ?? "").toUpperCase();
  if (product === "REELS") return true;
  if (product) return false;
  const type = post.mediaType.toUpperCase();
  return type === "VIDEO" || type === "REEL" || type === "REELS";
}

async function fetchMediaPlayCount(mediaId: string, accessToken: string, reel: boolean): Promise<number | null> {
  // `views` is the current media metric. `plays` remains as a fallback for older reels.
  // Do not request deprecated `video_views`.
  const metrics = reel ? ["views", "plays"] : ["views"];
  for (const metric of metrics) {
    const params = new URLSearchParams({
      metric,
      access_token: accessToken,
    });
    try {
      const res = await fetch(`https://graph.instagram.com/${mediaId}/insights?${params.toString()}`);
      const body = await readJson<unknown>(res, "Instagram rejected a media insights request.");
      if (!res.ok) continue;
      const value = insightNumeric(body);
      if (value !== null) return value;
    } catch {
      // Other posts still sync if one media insight call fails.
    }
  }
  return null;
}

async function attachPlayCounts(accessToken: string, rows: MediaRow[]): Promise<void> {
  const chunkSize = 4;
  for (let i = 0; i < rows.length; i += chunkSize) {
    const chunk = rows.slice(i, i + chunkSize);
    await Promise.all(
      chunk.map(async (row) => {
        row.playCount = await fetchMediaPlayCount(row.id, accessToken, isReelMedia(row));
      }),
    );
  }
}

export async function fetchMonthlyReach(igUserId: string, accessToken: string): Promise<number | null> {
  const until = Math.floor(Date.now() / 1000);
  const since = until - 28 * 24 * 60 * 60;

  const attempts: URLSearchParams[] = [
    new URLSearchParams({
      metric: "reach",
      period: "days_28",
      metric_type: "total_value",
      access_token: accessToken,
    }),
    new URLSearchParams({
      metric: "reach",
      period: "day",
      metric_type: "total_value",
      since: String(since),
      until: String(until),
      access_token: accessToken,
    }),
    new URLSearchParams({
      metric: "reach",
      period: "days_28",
      access_token: accessToken,
    }),
  ];

  for (const params of attempts) {
    try {
      const res = await fetch(`https://graph.instagram.com/${igUserId}/insights?${params.toString()}`);
      const body = await readJson<unknown>(res, "Instagram rejected the reach insights request.");
      if (!res.ok) continue;
      const value = insightNumeric(body);
      if (value !== null) return Math.round(value);
    } catch {
      // Reach is optional; stats still land without it.
    }
  }
  return null;
}

export function computeAvgReelViews(media: RecentPost[]): number | null {
  const reels = media.filter((item) => isReelMedia(item) && item.playCount !== null);
  if (reels.length === 0) return null;
  const total = reels.reduce((sum, item) => sum + (item.playCount ?? 0), 0);
  return total / reels.length;
}

export async function fetchRecentMediaEngagement(accessToken: string): Promise<RecentPost[]> {
  const params = new URLSearchParams({
    fields:
      "id,caption,like_count,comments_count,thumbnail_url,media_url,permalink,media_type,media_product_type,timestamp",
    limit: "12",
    access_token: accessToken,
  });

  let res: Response;
  try {
    res = await fetch(`https://graph.instagram.com/me/media?${params.toString()}`);
  } catch {
    throw new InstagramApiError("Could not reach Instagram to load your recent posts.");
  }

  const body = await readJson<{
    data?: Array<{
      id?: string;
      caption?: string;
      like_count?: number;
      comments_count?: number;
      thumbnail_url?: string;
      media_url?: string;
      permalink?: string;
      media_type?: string;
      media_product_type?: string;
      timestamp?: string;
    }>;
    error?: { message?: string };
  }>(res, "Instagram rejected the media request.");

  if (!res.ok) {
    throw new InstagramApiError(
      graphErrorMessage(body, "Instagram did not return recent posts. Try Sync now in a few minutes."),
      res.status,
    );
  }

  const rows: MediaRow[] = (body.data ?? [])
    .filter((item) => Boolean(item.id))
    .map((item) => ({
      id: String(item.id),
      likeCount: item.like_count ?? 0,
      commentsCount: item.comments_count ?? 0,
      mediaType: item.media_type ?? "IMAGE",
      mediaProductType: item.media_product_type ?? null,
      permalink: item.permalink ?? null,
      thumbnailUrl: item.thumbnail_url || item.media_url || null,
      timestamp: item.timestamp ?? null,
      playCount: null,
      caption: item.caption ? item.caption.slice(0, CAPTION_STORE_LIMIT) : null,
    }));

  await attachPlayCounts(accessToken, rows);
  return rows.map(({ id: _id, ...post }) => post);
}

type InsightResult = { dimension_values?: string[]; value?: number };

type InsightPayload = {
  data?: Array<{
    total_value?: { breakdowns?: Array<{ results?: InsightResult[] }> };
  }>;
  error?: { message?: string };
};

function toShares(rows: Array<{ key: string; value: number }>): Record<string, number> {
  const total = rows.reduce((sum, row) => sum + row.value, 0);
  if (total <= 0) return {};
  const out: Record<string, number> = {};
  for (const row of rows) {
    out[row.key] = row.value / total;
  }
  return out;
}

function parseInsightResults(body: InsightPayload): Array<{ key: string; value: number }> {
  const results =
    body.data?.[0]?.total_value?.breakdowns?.[0]?.results ?? [];
  return results
    .map((row) => ({
      key: (row.dimension_values ?? []).join(", ") || "unknown",
      value: Number(row.value ?? 0),
    }))
    .filter((row) => row.value > 0);
}

async function fetchDemographicBreakdown(
  igUserId: string,
  accessToken: string,
  breakdown: "age" | "gender" | "city" | "country",
): Promise<Array<{ key: string; value: number }>> {
  const params = new URLSearchParams({
    metric: "follower_demographics",
    period: "lifetime",
    timeframe: "this_month",
    breakdown,
    metric_type: "total_value",
    access_token: accessToken,
  });

  let res: Response;
  try {
    res = await fetch(`https://graph.instagram.com/${igUserId}/insights?${params.toString()}`);
  } catch {
    throw new InstagramApiError(
      `Could not reach Instagram to load ${breakdown} audience insights.`,
    );
  }

  const body = await readJson<InsightPayload>(
    res,
    `Instagram rejected the ${breakdown} insights request.`,
  );

  if (!res.ok) {
    throw new InstagramApiError(
      graphErrorMessage(
        body,
        `Instagram did not return ${breakdown} audience insights. Insights can lag up to 48 hours — try again later.`,
      ),
      res.status,
    );
  }

  return parseInsightResults(body);
}

function normalizeGender(raw: Record<string, number>): AudienceDemographics["genderSplit"] {
  let female = 0;
  let male = 0;
  let undisclosed = 0;
  for (const [key, value] of Object.entries(raw)) {
    const k = key.toLowerCase();
    if (k === "f" || k === "female") female += value;
    else if (k === "m" || k === "male") male += value;
    else undisclosed += value;
  }
  const total = female + male + undisclosed;
  if (total <= 0) return { female: 0, male: 0, undisclosed: 0 };
  return {
    female: female / total,
    male: male / total,
    undisclosed: undisclosed / total,
  };
}

function topPlaces(rows: Array<{ key: string; value: number }>, limit = 5): PlaceShare[] {
  const shares = toShares(rows);
  return Object.entries(shares)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([name, share]) => ({ name, share }));
}

export async function fetchFollowerDemographics(
  igUserId: string,
  accessToken: string,
  followersCount: number,
): Promise<AudienceDemographics | null> {
  if (followersCount < AUDIENCE_MIN_FOLLOWERS) return null;

  let failed = 0;
  async function safeBreakdown(breakdown: "age" | "gender" | "city" | "country") {
    try {
      return await fetchDemographicBreakdown(igUserId, accessToken, breakdown);
    } catch {
      failed += 1;
      return [];
    }
  }

  const ageRows = await safeBreakdown("age");
  const genderRows = await safeBreakdown("gender");
  const cityRows = await safeBreakdown("city");
  const countryRows = await safeBreakdown("country");

  if (failed === 4) {
    throw new InstagramApiError(
      "Instagram did not return audience insights. Confirm instagram_business_manage_insights is granted, then use Sync now. Insights can lag up to 48 hours.",
    );
  }

  const ageBrackets = toShares(ageRows);
  const genderSplit = normalizeGender(toShares(genderRows));
  const topCities = topPlaces(cityRows);
  const topCountries = topPlaces(countryRows);

  const hasAny =
    Object.keys(ageBrackets).length > 0 ||
    genderSplit.female + genderSplit.male + genderSplit.undisclosed > 0 ||
    topCities.length > 0 ||
    topCountries.length > 0;

  if (!hasAny) return null;

  return { ageBrackets, genderSplit, topCities, topCountries };
}

export type ContentMix = {
  image: number;
  video: number;
  carousel: number;
};

export function computeContentMix(media: Array<{ mediaType: string }>): ContentMix {
  const total = media.length;
  if (total === 0) return { image: 0, video: 0, carousel: 0 };
  let image = 0;
  let video = 0;
  let carousel = 0;
  for (const item of media) {
    const type = item.mediaType.toUpperCase();
    if (type === "CAROUSEL_ALBUM") carousel += 1;
    else if (type === "VIDEO" || type === "REELS" || type === "REEL") video += 1;
    else image += 1;
  }
  return { image: image / total, video: video / total, carousel: carousel / total };
}

export function postsForSnapshot(media: RecentPost[], limit = 12): RecentPost[] {
  return media.slice(0, limit);
}

export function computeEngagement(
  media: Array<{ likeCount: number; commentsCount: number }>,
  followersCount: number,
): { engagementRate: number; avgLikes: number; avgComments: number; postsAnalyzed: number } {
  const postsAnalyzed = media.length;
  if (postsAnalyzed === 0 || followersCount <= 0) {
    return { engagementRate: 0, avgLikes: 0, avgComments: 0, postsAnalyzed };
  }
  const avgLikes = media.reduce((sum, m) => sum + m.likeCount, 0) / postsAnalyzed;
  const avgComments = media.reduce((sum, m) => sum + m.commentsCount, 0) / postsAnalyzed;
  const engagementRate = ((avgLikes + avgComments) / followersCount) * 100;
  return { engagementRate, avgLikes, avgComments, postsAnalyzed };
}
