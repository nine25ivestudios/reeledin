# Reeledin

Verified Instagram stats for creators. Connect once, send brands `reeledin.com/{handle}` instead of a screenshot.

**Verified, not self-reported.**

## Stack

Next.js 14 (App Router, TypeScript) · Prisma · SQLite locally, Postgres in production · Instagram Business Login (no Facebook Page) · HMAC session cookie · AES-256-GCM token storage.

No Supabase, Lovable Cloud, or NextAuth. The database is never queried from the browser.

## Project layout

```
app/
  page.tsx                          marketing homepage
  layout.tsx                        fonts + tokens
  globals.css                       CSS variables
  dashboard/page.tsx                private dashboard (noindex)
  [handle]/page.tsx                 public credential
  privacy/page.tsx
  deletion-status/page.tsx
  api/auth/instagram/route.ts       start OAuth
  api/auth/instagram/callback/      finish OAuth
  api/auth/logout/route.ts
  api/sync/route.ts                 session sync or cron bulk
  api/data-deletion/route.ts        Meta callback
components/                         UI (PublicProfile, FreshnessRing, Stat, TrendSection, …)
lib/                                prisma, session, crypto, instagram, sync, freshness
prisma/schema.prisma                User, ConnectedAccount, StatsSnapshot, AudienceSnapshot, Profile
```

## Local setup

1. Copy env and generate secrets:

```bash
cp .env.example .env
```

PowerShell:

```powershell
Copy-Item .env.example .env
```

Fill:

- `TOKEN_ENCRYPTION_KEY` and `SESSION_SECRET`: `openssl rand -hex 32` for each
- `CRON_SECRET`: any long random string
- `DATABASE_URL="file:./dev.db"`
- `APP_URL="http://localhost:3000"`
- `INSTAGRAM_REDIRECT_URI="http://localhost:3000/api/auth/instagram/callback"`
- Instagram App ID / Secret from the steps below

2. Install and create the database:

```bash
npm install
npx prisma db push
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Create the Meta app (Business Login for Instagram)

This is **not** Facebook Login for Business. Creators should not need a linked Facebook Page.

1. Go to [developers.facebook.com](https://developers.facebook.com/apps/) and create an app. Type: **Business**.
2. In the app dashboard, add the **Instagram** product.
3. Open **Instagram → API setup with Instagram login** (Instagram API with Instagram login / Business Login). Do **not** use Facebook Login for Business as the path for this product.
4. Request both permissions (they are separate App Review items):
   - `instagram_business_basic` — profile, followers, media, engagement
   - `instagram_business_manage_insights` — follower demographics (age, gender, city, country)
5. Set **Valid OAuth Redirect URIs** to exactly:
   - Local: `http://localhost:3000/api/auth/instagram/callback`
   - Production: `https://YOUR_DOMAIN/api/auth/instagram/callback`
6. Copy the **Instagram App ID** into `INSTAGRAM_APP_ID` and the **App Secret** into `INSTAGRAM_APP_SECRET`.
7. Settings → Basic: privacy policy URL `https://YOUR_DOMAIN/privacy`.
8. Data Deletion Request Callback URL: `https://YOUR_DOMAIN/api/data-deletion`.

Insights call used at sync (one breakdown per request, skipped under 100 followers):

`GET https://graph.instagram.com/{ig-user-id}/insights?metric=follower_demographics&period=lifetime&timeframe=this_month&breakdown={age|gender|city|country}&metric_type=total_value`

Confirm names against [Instagram account insights](https://developers.facebook.com/docs/instagram-platform/api-reference/instagram-user/insights) before App Review — Meta revises these without much notice.

### Who can connect

- **Standard Access:** you and testers added under App Roles. Enough to build and record the App Review demo. Zero review required.
- **Advanced Access:** required before arbitrary (non-tester) creators can connect. Prepare a connect-flow screencast, a live privacy policy, and the data-deletion callback, then submit both scopes. Typical turnaround 1–2 weeks.
- The Instagram account must be **Business or Creator**. Personal accounts have no API access. Reeledin explains that on failed connect.

### Local OAuth on localhost

Meta allows `http://localhost` redirect URIs for development. Use the same `INSTAGRAM_REDIRECT_URI` in `.env` and the dashboard, character for character (no trailing slash).

## Production

1. Change Prisma provider when you move off SQLite:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

Set `DATABASE_URL` to a Postgres URL (Neon, Vercel Postgres, or Railway). Run `npx prisma db push` or `npx prisma migrate deploy`.

2. Host on Vercel (hobby) or Railway. Set every variable from `.env.example`.
   - `APP_URL=https://YOUR_DOMAIN`
   - `INSTAGRAM_REDIRECT_URI=https://YOUR_DOMAIN/api/auth/instagram/callback`
   - Production cookies are `Secure`.

3. Budget: stay on free/hobby tiers (ceiling ₹5,000/month). No extra auth vendor. Bulk sync is a single POST.

### Refresh job

`POST /api/sync` with header `Authorization: Bearer CRON_SECRET` refreshes every connected account, staggered. Tokens with under ~7 days remaining are refreshed first. Audience demographics sync on a slower cadence (~48 hours), matching Instagram’s lag — not the same interval as follower count.

```bash
curl -X POST https://YOUR_DOMAIN/api/sync \
  -H "Authorization: Bearer $CRON_SECRET"
```

Manual **Sync now** uses the session cookie and only that creator’s account.

## Routes

| Path | Purpose |
| --- | --- |
| `/` | Marketing (demo recently-verified + leaderboard) |
| `/dashboard` | Same profile brands see, plus sync, public-link toggle, sign out |
| `/{handle}` | Public credential |
| `/privacy` | Privacy policy (App Review) |
| `/api/auth/instagram` | Start OAuth |
| `/api/auth/instagram/callback` | Finish OAuth |
| `/api/sync` | Manual or cron sync |
| `/api/data-deletion` | Meta deletion callback |
| `/deletion-status` | Deletion confirmation page |

## What this does not include

No payments, no YouTube yet (`platform` is ready), no live public directory of real creators. Homepage boards are demo data on purpose.
