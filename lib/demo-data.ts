/**
 * Fictional sample creator for /demo and the homepage preview.
 * Pure data: never import prisma or session code here, so the sample can't reach real creators.
 */
import { roundToHour } from "./freshness";
import type { RecentPost } from "./instagram";
import {
  buildPublicProfileView,
  type DailyInsightRow,
  type ProfileSnapshotRow,
  type PublicProfileView,
} from "./profile-view";

export const DEMO_SLUG = "demo";

const DAY = 86_400_000;
const HOUR = 3_600_000;

type DemoPost = Omit<RecentPost, "timestamp" | "permalink"> & { daysAgo: number };

const POSTS: DemoPost[] = [
  {
    caption:
      "Twelve vada pav stalls in one day — ranked, honestly.\nWhich one did I miss? #mumbaifood #streetfood #vadapav",
    mediaType: "VIDEO",
    mediaProductType: "REELS",
    likeCount: 4820,
    commentsCount: 312,
    playCount: 118400,
    thumbnailUrl: "/images/maya-kapadia-placeholder.png",
    daysAgo: 4,
  },
  {
    caption: "Monsoon weekend in Lonavala: chai, fog and far too much bhutta. #travel #monsoon #weekendtrip",
    mediaType: "VIDEO",
    mediaProductType: "REELS",
    likeCount: 2960,
    commentsCount: 141,
    playCount: 61200,
    thumbnailUrl: null,
    daysAgo: 7,
  },
  {
    caption: "Grandma's sol kadhi, written down for the first time. Recipe in the caption. #homecooking #recipe",
    mediaType: "CAROUSEL_ALBUM",
    mediaProductType: "FEED",
    likeCount: 2410,
    commentsCount: 188,
    playCount: null,
    thumbnailUrl: null,
    daysAgo: 9,
  },
  {
    caption: "Bandra cafe crawl: five cafes, one rainy afternoon. #mumbaifood #cafe #streetfood",
    mediaType: "VIDEO",
    mediaProductType: "REELS",
    likeCount: 2680,
    commentsCount: 96,
    playCount: 48900,
    thumbnailUrl: null,
    daysAgo: 12,
  },
  {
    caption: "Slow travel in Gokarna — the beaches nobody posts about. #travel #slowtravel",
    mediaType: "VIDEO",
    mediaProductType: "REELS",
    likeCount: 2240,
    commentsCount: 84,
    playCount: 39700,
    thumbnailUrl: null,
    daysAgo: 15,
  },
  {
    caption: "Weeknight dal tadka in 20 minutes. Save this one. #homecooking #recipe",
    mediaType: "VIDEO",
    mediaProductType: "REELS",
    likeCount: 2190,
    commentsCount: 132,
    playCount: 35200,
    thumbnailUrl: null,
    daysAgo: 18,
  },
  {
    caption: "Khau Galli at midnight. Pav bhaji, kulfi, repeat. #mumbaifood #streetfood",
    mediaType: "VIDEO",
    mediaProductType: "REELS",
    likeCount: 2050,
    commentsCount: 77,
    playCount: 31800,
    thumbnailUrl: null,
    daysAgo: 21,
  },
  {
    caption: "Packing list for a monsoon trip to the Western Ghats. #travel #monsoon",
    mediaType: "CAROUSEL_ALBUM",
    mediaProductType: "FEED",
    likeCount: 1880,
    commentsCount: 64,
    playCount: null,
    thumbnailUrl: null,
    daysAgo: 24,
  },
  {
    caption: "Trying every chutney at a Matunga breakfast spot. #mumbaifood #breakfast",
    mediaType: "VIDEO",
    mediaProductType: "REELS",
    likeCount: 1960,
    commentsCount: 58,
    playCount: 28600,
    thumbnailUrl: null,
    daysAgo: 27,
  },
  {
    caption: "Mango season recipe #3: aamras, the way my mother makes it. #homecooking #recipe",
    mediaType: "IMAGE",
    mediaProductType: "FEED",
    likeCount: 1720,
    commentsCount: 91,
    playCount: null,
    thumbnailUrl: null,
    daysAgo: 30,
  },
  {
    caption: "Three days in Hampi on a small budget. Full itinerary saved to highlights. #travel #slowtravel",
    mediaType: "VIDEO",
    mediaProductType: "REELS",
    likeCount: 1840,
    commentsCount: 73,
    playCount: 27400,
    thumbnailUrl: null,
    daysAgo: 33,
  },
  {
    caption: "Street-side misal pav that's worth the queue. #streetfood #breakfast",
    mediaType: "VIDEO",
    mediaProductType: "REELS",
    likeCount: 1690,
    commentsCount: 52,
    playCount: 24100,
    thumbnailUrl: null,
    daysAgo: 36,
  },
];

const AUDIENCE = {
  ageBrackets: { "13-17": 0.03, "18-24": 0.34, "25-34": 0.41, "35-44": 0.14, "45-54": 0.05, "55-64": 0.02, "65+": 0.01 },
  genderSplit: { female: 0.58, male: 0.38, undisclosed: 0.04 },
  topCities: [
    { name: "Mumbai, Maharashtra", share: 0.31 },
    { name: "Pune, Maharashtra", share: 0.11 },
    { name: "Bangalore, Karnataka", share: 0.08 },
    { name: "Delhi, Delhi", share: 0.07 },
    { name: "Thane, Maharashtra", share: 0.05 },
  ],
  topCountries: [
    { name: "IN", share: 0.82 },
    { name: "AE", share: 0.05 },
    { name: "US", share: 0.04 },
    { name: "GB", share: 0.03 },
    { name: "SG", share: 0.02 },
  ],
};

/** Snapshots every 3 days for ~60 days, growing into the latest numbers. Only the headline deltas read these. */
const SNAPSHOT_STEPS = 21;
const START = { followers: 38950, engagement: 5.1, reach: 141000, views: 0.82 };
const END = { followers: 42800, engagement: 5.8, reach: 186400, views: 1 };

const DAILY_DAYS = 30;

function smoothstep(t: number) {
  return t * t * (3 - 2 * t);
}

/**
 * Designed daily curves for the charts, ending yesterday like Instagram's latest complete day.
 * Reach climbs slowly with a soft rhythm and lifts for a couple of days after each reel;
 * engagement eases up and lands exactly on the 5.8% headline.
 */
function demoDaily(lastSyncedAt: Date): DailyInsightRow[] {
  const syncDay = Date.UTC(lastSyncedAt.getUTCFullYear(), lastSyncedAt.getUTCMonth(), lastSyncedAt.getUTCDate());
  const reels = POSTS.filter((post) => post.playCount !== null);
  const engagementAt = (t: number) => 5.46 + 0.3 * smoothstep(t) + 0.04 * Math.sin(t * Math.PI * 2.4);
  const engagementFix = END.engagement - engagementAt(1);

  return Array.from({ length: DAILY_DAYS }, (_, i) => {
    const t = i / (DAILY_DAYS - 1);
    const daysAgo = DAILY_DAYS - i;
    const base = 8400 + 1900 * smoothstep(t);
    const rhythm = 1 + 0.035 * Math.sin(t * Math.PI * 2 * 2.2 + 0.6);
    const lift = reels.reduce(
      (sum, post) => sum + (post.playCount as number) * 0.018 * Math.exp(-((daysAgo - (post.daysAgo - 1)) ** 2) / 5.12),
      0,
    );
    return {
      date: new Date(syncDay - daysAgo * DAY),
      reach: Math.round((base * rhythm + lift) / 10) * 10,
      engagementRate: Number((engagementAt(t) + engagementFix * t).toFixed(3)),
    };
  });
}

function postsJson(lastSyncedAt: Date, viewScale: number) {
  return JSON.stringify(
    POSTS.map(({ daysAgo, ...post }) => ({
      ...post,
      permalink: null,
      timestamp: new Date(lastSyncedAt.getTime() - daysAgo * DAY).toISOString(),
      playCount: post.playCount === null ? null : Math.round(post.playCount * viewScale),
    })),
  );
}

export function getDemoProfile(now = new Date()): PublicProfileView {
  const lastSyncedAt = new Date(roundToHour(now).getTime() - HOUR);

  const history: ProfileSnapshotRow[] = Array.from({ length: SNAPSHOT_STEPS }, (_, i) => {
    const t = i / (SNAPSHOT_STEPS - 1);
    const takenAt = new Date(lastSyncedAt.getTime() - (SNAPSHOT_STEPS - 1 - i) * 3 * DAY);
    const lerp = (a: number, b: number) => a + (b - a) * t;
    return {
      takenAt,
      followersCount: Math.round(lerp(START.followers, END.followers)),
      engagementRate: Number(lerp(START.engagement, END.engagement).toFixed(2)),
      postsAnalyzed: POSTS.length,
      reach: Math.round(lerp(START.reach, END.reach)),
      recentPosts: postsJson(takenAt, lerp(START.views, END.views)),
    };
  });

  return buildPublicProfileView({
    slug: DEMO_SLUG,
    name: "Maya Kapadia",
    biography: "Food and slow travel from Mumbai. Street eats, weekend trips and recipes from home.",
    username: "maya.kapadia",
    profilePictureUrl: null,
    lastSyncedAt,
    history,
    daily: demoDaily(lastSyncedAt),
    audience: {
      ageBrackets: JSON.stringify(AUDIENCE.ageBrackets),
      genderSplit: JSON.stringify(AUDIENCE.genderSplit),
      topCities: JSON.stringify(AUDIENCE.topCities),
      topCountries: JSON.stringify(AUDIENCE.topCountries),
      takenAt: new Date(lastSyncedAt.getTime() - 20 * HOUR),
    },
  });
}
