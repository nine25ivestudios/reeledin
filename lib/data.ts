import type { AudienceSnapshot, ConnectedAccount, DailyInsight, StatsSnapshot } from "@prisma/client";
import { cookies } from "next/headers";
import { prisma } from "./prisma";
import { getSessionUserId } from "./session";
import { buildPublicProfileView, TREND_DAYS, type PublicProfileView } from "./profile-view";

export type {
  AgeBrackets,
  AudienceView,
  CredentialDeltas,
  GenderSplit,
  ProfileSnapshotRow,
  ProfileTrends,
  PublicProfileView,
  TrendSeries,
} from "./profile-view";
export { parseAgeBrackets, parseGenderSplit, parsePlaces, parseRecentPosts } from "./profile-view";

type AccountWithHistory = ConnectedAccount & {
  snapshots: StatsSnapshot[];
  audienceSnapshots: AudienceSnapshot[];
  dailyInsights: DailyInsight[];
};

const accountInclude = {
  snapshots: { orderBy: { takenAt: "asc" } },
  audienceSnapshots: { orderBy: { takenAt: "desc" }, take: 1 },
  // Reach lags engagement by a day, so fetch a little past the window; buildTrends trims per series.
  dailyInsights: { orderBy: { date: "desc" }, take: TREND_DAYS + 3 },
} as const;

function primaryAccount<T extends { platform: string }>(accounts: T[]): T | null {
  return accounts.find((a) => a.platform === "instagram") ?? accounts[0] ?? null;
}

/** Dashboard and public page both render through here, so name and bio can only come from the synced account. */
function viewFromAccount(slug: string, account: AccountWithHistory): PublicProfileView | null {
  if (account.snapshots.length === 0) return null;
  return buildPublicProfileView({
    slug,
    name: account.name,
    biography: account.biography,
    username: account.username,
    profilePictureUrl: account.profilePictureUrl,
    lastSyncedAt: account.lastSyncedAt,
    history: account.snapshots,
    daily: account.dailyInsights,
    audience: account.audienceSnapshots[0] ?? null,
  });
}

export async function getDashboardData() {
  const userId = await getSessionUserId();
  if (!userId) return null;

  let user;
  try {
    user = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true, accounts: { include: accountInclude } },
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

  const account = primaryAccount(user.accounts);
  const profile = user.profile;
  const view = account && profile ? viewFromAccount(profile.slug, account) : null;

  return { account, profile, view };
}

export async function getPublicCredential(slug: string): Promise<PublicProfileView | null> {
  const profile = await prisma.profile.findUnique({
    where: { slug: slug.toLowerCase() },
    include: { user: { include: { accounts: { include: accountInclude } } } },
  });

  if (!profile || !profile.isPublic) return null;

  const account = primaryAccount(profile.user.accounts);
  return account ? viewFromAccount(profile.slug, account) : null;
}
