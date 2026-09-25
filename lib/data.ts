import { cookies } from "next/headers";
import { prisma } from "./prisma";
import { getSessionUserId } from "./session";
import { computeAvgReelViews } from "./instagram";
import {
  buildPublicProfileView,
  computeDeltas,
  mapAudience,
  parseRecentPosts,
  type PublicProfileView,
  type TrendPoint,
} from "./profile-view";

export type {
  AgeBrackets,
  AudienceView,
  CredentialDeltas,
  GenderSplit,
  ProfileSnapshotRow,
  PublicProfileView,
  TrendPoint,
} from "./profile-view";
export { parseAgeBrackets, parseGenderSplit, parsePlaces, parseRecentPosts } from "./profile-view";

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

export async function getPublicCredential(slug: string): Promise<PublicProfileView | null> {
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
  if (account.snapshots.length === 0) return null;

  return buildPublicProfileView({
    slug: profile.slug,
    displayName: profile.displayName,
    bio: profile.bio,
    username: account.username,
    profilePictureUrl: account.profilePictureUrl,
    lastSyncedAt: account.lastSyncedAt,
    history: account.snapshots,
    audience: account.audienceSnapshots[0] ?? null,
  });
}
