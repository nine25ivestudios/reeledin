import { encryptToken } from "./crypto";
import {
  computeEngagement,
  exchangeCodeForShortLivedToken,
  exchangeForLongLivedToken,
  fetchFollowerDemographics,
  fetchInstagramProfile,
  fetchMonthlyReach,
  fetchRecentMediaEngagement,
  postsForSnapshot,
} from "./instagram";
import { prisma } from "./prisma";
import { uniqueSlug } from "./slug";
import { recordDailyInsights } from "./sync";

export async function connectFromAuthorizationCode(code: string) {
  const shortLived = await exchangeCodeForShortLivedToken(code);
  const longLived = await exchangeForLongLivedToken(shortLived.accessToken);
  const ig = await fetchInstagramProfile(longLived.accessToken);
  const media = await fetchRecentMediaEngagement(longLived.accessToken);
  const stats = computeEngagement(media, ig.followersCount);
  const reach = await fetchMonthlyReach(ig.id, longLived.accessToken);
  const encrypted = encryptToken(longLived.accessToken);
  const tokenExpiresAt = new Date(Date.now() + longLived.expiresIn * 1000);

  const existingAccount = await prisma.connectedAccount.findUnique({
    where: {
      platform_externalId: { platform: "instagram", externalId: ig.id },
    },
  });

  const user = existingAccount
    ? await prisma.user.findUniqueOrThrow({ where: { id: existingAccount.userId } })
    : await prisma.user.create({ data: {} });

  const account = await prisma.connectedAccount.upsert({
    where: {
      platform_externalId: { platform: "instagram", externalId: ig.id },
    },
    create: {
      userId: user.id,
      platform: "instagram",
      externalId: ig.id,
      username: ig.username,
      accountType: ig.accountType,
      accessToken: encrypted,
      tokenExpiresAt,
      lastSyncedAt: new Date(),
      lastSyncError: null,
      profilePictureUrl: ig.profilePictureUrl ?? null,
      name: ig.name,
      biography: ig.biography,
    },
    update: {
      username: ig.username,
      accountType: ig.accountType,
      accessToken: encrypted,
      tokenExpiresAt,
      lastSyncedAt: new Date(),
      lastSyncError: null,
      profilePictureUrl: ig.profilePictureUrl ?? null,
      name: ig.name,
      biography: ig.biography,
    },
  });

  await prisma.statsSnapshot.create({
    data: {
      accountId: account.id,
      followersCount: ig.followersCount,
      mediaCount: ig.mediaCount,
      engagementRate: stats.engagementRate,
      avgLikes: stats.avgLikes,
      avgComments: stats.avgComments,
      postsAnalyzed: stats.postsAnalyzed,
      recentPosts: JSON.stringify(postsForSnapshot(media)),
      reach,
    },
  });

  try {
    const audience = await fetchFollowerDemographics(ig.id, longLived.accessToken, ig.followersCount);
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
  } catch {
    // Insights are a separate permission and can lag. Stats still land; dashboard will retry on sync.
  }

  try {
    await recordDailyInsights(account.id, ig.id, longLived.accessToken, ig.followersCount);
  } catch {
    // Graphs fall back to per-sync snapshots until a later sync backfills.
  }

  const slug = await uniqueSlug(ig.username, user.id);

  await prisma.profile.upsert({
    where: { userId: user.id },
    create: { userId: user.id, slug },
    update: { slug },
  });

  return { userId: user.id };
}
