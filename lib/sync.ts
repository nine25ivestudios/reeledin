import { ConnectedAccount } from "@prisma/client";
import { decryptToken, encryptToken } from "./crypto";
import { prisma } from "./prisma";
import {
  AUDIENCE_MIN_FOLLOWERS,
  AUDIENCE_SYNC_INTERVAL_MS,
  computeEngagement,
  fetchFollowerDemographics,
  fetchInstagramProfile,
  fetchRecentMediaEngagement,
  InstagramApiError,
  postsForSnapshot,
  refreshLongLivedToken,
} from "./instagram";

const REFRESH_IF_EXPIRES_WITHIN_MS = 7 * 24 * 60 * 60 * 1000;

async function ensureFreshToken(account: ConnectedAccount): Promise<string> {
  let token = decryptToken(account.accessToken);
  const remaining = account.tokenExpiresAt.getTime() - Date.now();

  if (remaining <= 0) {
    throw new InstagramApiError(
      "Your Instagram connection expired. Connect Instagram again to restore access.",
    );
  }

  const assumedLifetimeMs = 60 * 24 * 60 * 60 * 1000;
  const tokenAgeMs = assumedLifetimeMs - remaining;
  const oldEnoughToRefresh = tokenAgeMs > 24 * 60 * 60 * 1000;

  if (remaining < REFRESH_IF_EXPIRES_WITHIN_MS && oldEnoughToRefresh) {
    try {
      const refreshed = await refreshLongLivedToken(token);
      token = refreshed.accessToken;
      await prisma.connectedAccount.update({
        where: { id: account.id },
        data: {
          accessToken: encryptToken(token),
          tokenExpiresAt: new Date(Date.now() + refreshed.expiresIn * 1000),
        },
      });
    } catch (error) {
      if (remaining < 24 * 60 * 60 * 1000) {
        throw error;
      }
    }
  }

  return token;
}

async function audienceDue(accountId: string): Promise<boolean> {
  const latest = await prisma.audienceSnapshot.findFirst({
    where: { accountId },
    orderBy: { takenAt: "desc" },
    select: { takenAt: true },
  });
  if (!latest) return true;
  return Date.now() - latest.takenAt.getTime() >= AUDIENCE_SYNC_INTERVAL_MS;
}

export async function syncAccount(accountId: string, options?: { forceAudience?: boolean }): Promise<void> {
  const account = await prisma.connectedAccount.findUnique({ where: { id: accountId } });
  if (!account) {
    throw new Error("No connected Instagram account found. Connect Instagram first.");
  }

  try {
    const token = await ensureFreshToken(account);
    const profile = await fetchInstagramProfile(token);
    const media = await fetchRecentMediaEngagement(token);
    const stats = computeEngagement(media, profile.followersCount);

    let audienceError: string | null = null;
    if (profile.followersCount >= AUDIENCE_MIN_FOLLOWERS && (options?.forceAudience || (await audienceDue(account.id)))) {
      try {
        const audience = await fetchFollowerDemographics(profile.id, token, profile.followersCount);
        if (audience) {
          await prisma.audienceSnapshot.create({
            data: {
              accountId: account.id,
              ageBrackets: JSON.stringify(audience.ageBrackets),
              genderSplit: JSON.stringify(audience.genderSplit),
              topCities: JSON.stringify(audience.topCities),
              topCountries: JSON.stringify(audience.topCountries),
            },
          });
        }
      } catch (error) {
        audienceError =
          error instanceof InstagramApiError
            ? error.message
            : error instanceof Error
              ? `Audience insights failed: ${error.message}`
              : "Audience insights failed talking to Instagram.";
      }
    }

    await prisma.$transaction([
      prisma.statsSnapshot.create({
        data: {
          accountId: account.id,
          followersCount: profile.followersCount,
          mediaCount: profile.mediaCount,
          engagementRate: stats.engagementRate,
          avgLikes: stats.avgLikes,
          avgComments: stats.avgComments,
          postsAnalyzed: stats.postsAnalyzed,
          recentPosts: JSON.stringify(postsForSnapshot(media)),
        },
      }),
      prisma.connectedAccount.update({
        where: { id: account.id },
        data: {
          username: profile.username,
          accountType: profile.accountType,
          profilePictureUrl: profile.profilePictureUrl ?? null,
          lastSyncedAt: new Date(),
          lastSyncError: audienceError,
        },
      }),
    ]);
  } catch (error) {
    const message =
      error instanceof InstagramApiError
        ? error.message
        : error instanceof Error
          ? `Sync failed: ${error.message}`
          : "Sync failed: Instagram or the database did not complete the request.";

    await prisma.connectedAccount.update({
      where: { id: account.id },
      data: { lastSyncError: message },
    });
    throw new InstagramApiError(message);
  }
}

export async function syncAllAccounts(): Promise<{ ok: number; failed: number }> {
  const accounts = await prisma.connectedAccount.findMany({
    where: { platform: "instagram" },
    select: { id: true },
  });

  let ok = 0;
  let failed = 0;
  for (const account of accounts) {
    try {
      await syncAccount(account.id);
      ok += 1;
    } catch {
      failed += 1;
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  return { ok, failed };
}
