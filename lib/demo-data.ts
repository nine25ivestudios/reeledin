export type DemoCreator = {
  handle: string;
  displayName: string;
  niche: string;
  followers: number;
  engagement: number;
  avgLikes: number;
  syncedHoursAgo: number;
  initials: string;
};

/** Homepage hero credential — sample data, same as the boards. */
export const DEMO_HERO: DemoCreator = {
  handle: "meera.eats",
  displayName: "Meera Iyer",
  niche: "Food",
  followers: 28400,
  engagement: 5.2,
  avgLikes: 1420,
  syncedHoursAgo: 2,
  initials: "MI",
};

export const DEMO_RECENT: DemoCreator[] = [
  {
    handle: "meera.eats",
    displayName: "Meera Iyer",
    niche: "Food",
    followers: 28400,
    engagement: 5.2,
    avgLikes: 1420,
    syncedHoursAgo: 1,
    initials: "MI",
  },
  {
    handle: "arjun.fits",
    displayName: "Arjun Shah",
    niche: "Fitness",
    followers: 61200,
    engagement: 3.8,
    avgLikes: 2180,
    syncedHoursAgo: 3,
    initials: "AS",
  },
  {
    handle: "nisha.studio",
    displayName: "Nisha Rao",
    niche: "Fashion",
    followers: 119000,
    engagement: 2.9,
    avgLikes: 3120,
    syncedHoursAgo: 5,
    initials: "NR",
  },
  {
    handle: "kabir.reels",
    displayName: "Kabir Menon",
    niche: "Comedy",
    followers: 8750,
    engagement: 8.1,
    avgLikes: 640,
    syncedHoursAgo: 2,
    initials: "KM",
  },
  {
    handle: "priya.skincare",
    displayName: "Priya Nair",
    niche: "Beauty",
    followers: 44100,
    engagement: 4.4,
    avgLikes: 1760,
    syncedHoursAgo: 8,
    initials: "PN",
  },
];

export const DEMO_LEADERBOARD: DemoCreator[] = [
  {
    handle: "nisha.studio",
    displayName: "Nisha Rao",
    niche: "Fashion",
    followers: 119000,
    engagement: 2.9,
    avgLikes: 3120,
    syncedHoursAgo: 5,
    initials: "NR",
  },
  {
    handle: "arjun.fits",
    displayName: "Arjun Shah",
    niche: "Fitness",
    followers: 61200,
    engagement: 3.8,
    avgLikes: 2180,
    syncedHoursAgo: 3,
    initials: "AS",
  },
  {
    handle: "priya.skincare",
    displayName: "Priya Nair",
    niche: "Beauty",
    followers: 44100,
    engagement: 4.4,
    avgLikes: 1760,
    syncedHoursAgo: 8,
    initials: "PN",
  },
  {
    handle: "meera.eats",
    displayName: "Meera Iyer",
    niche: "Food",
    followers: 28400,
    engagement: 5.2,
    avgLikes: 1420,
    syncedHoursAgo: 1,
    initials: "MI",
  },
  {
    handle: "dev.techbytes",
    displayName: "Dev Kapoor",
    niche: "Tech",
    followers: 19300,
    engagement: 6.0,
    avgLikes: 980,
    syncedHoursAgo: 12,
    initials: "DK",
  },
  {
    handle: "sara.money",
    displayName: "Sara Qureshi",
    niche: "Personal finance",
    followers: 15200,
    engagement: 4.7,
    avgLikes: 610,
    syncedHoursAgo: 6,
    initials: "SQ",
  },
  {
    handle: "kabir.reels",
    displayName: "Kabir Menon",
    niche: "Comedy",
    followers: 8750,
    engagement: 8.1,
    avgLikes: 640,
    syncedHoursAgo: 2,
    initials: "KM",
  },
  {
    handle: "anika.home",
    displayName: "Anika Bose",
    niche: "Home",
    followers: 6100,
    engagement: 5.5,
    avgLikes: 290,
    syncedHoursAgo: 20,
    initials: "AB",
  },
];
