import { cookies } from "next/headers";
import { prisma } from "./prisma";
import { getSessionUserId } from "./session";
import type { PlaceShare, RecentPost } from "./instagram";

export type AgeBrackets = Record<string, number>;
export type GenderSplit = { female: number; male: number; undisclosed: number };

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
  return parsed
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const rec = item as Record<string, unknown>;
      return {
        thumbnailUrl: rec.thumbnailUrl ? String(rec.thumbnailUrl) : null,
        permalink: rec.permalink ? String(rec.permalink) : null,
        mediaType: String(rec.mediaType ?? "IMAGE"),
        likeCount: Number(rec.likeCount ?? 0) || 0,
        commentsCount: Number(rec.commentsCount ?? 0) || 0,
      };
    })
    .filter((item): item is RecentPost => item !== null);
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
  const audienceRow = account?.audienceSnapshots[0] ?? null;
  const audience = audienceRow
    ? {
        ageBrackets: parseAgeBrackets(audienceRow.ageBrackets),
        genderSplit: parseGenderSplit(audienceRow.genderSplit),
        topCities: parsePlaces(audienceRow.topCities),
        topCountries: parsePlaces(audienceRow.topCountries),
        takenAt: audienceRow.takenAt,
      }
    : null;
  const recentPosts = snapshot ? parseRecentPosts(snapshot.recentPosts) : [];
  const previous = history.length > 1 ? history[history.length - 2] : null;

  return { user, account, snapshot, history, previous, audience, recentPosts, profile: user.profile };
}

export async function getPublicCredential(slug: string) {
  const profile = await prisma.profile.findUnique({
    where: { slug: slug.toLowerCase() },
    include: {
      user: {
        include: {
          accounts: {
            include: {
              snapshots: { orderBy: { takenAt: "desc" }, take: 1 },
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

  const snapshot = account.snapshots[0];
  if (!snapshot) return null;

  const audienceRow = account.audienceSnapshots[0] ?? null;
  const audience = audienceRow
    ? {
        ageBrackets: parseAgeBrackets(audienceRow.ageBrackets),
        genderSplit: parseGenderSplit(audienceRow.genderSplit),
        topCities: parsePlaces(audienceRow.topCities),
        topCountries: parsePlaces(audienceRow.topCountries),
        takenAt: audienceRow.takenAt,
      }
    : null;

  return { profile, account, snapshot, audience };
}
