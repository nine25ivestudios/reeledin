import { LegalH2, LegalList, LegalP, LegalPage } from "@/components/LegalPage";

export const metadata = { title: "Privacy — ReeledIn" };

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy policy" updated="26 September 2026">
      <LegalP>
        ReeledIn is a verified Instagram stats page for creators. You connect a Professional Instagram
        account (Business or Creator) through Instagram&apos;s own login. We read the stats Instagram
        allows us to read, store them so your page stays current, and — if you leave your link public —
        show them to anyone you send that link to.
      </LegalP>
      <LegalP>
        This policy describes what the current product actually does. It does not invent features.
      </LegalP>

      <LegalH2>Who this applies to</LegalH2>
      <LegalP>
        People who tap Connect Instagram and complete Instagram&apos;s authorization. Brands who open a
        public ReeledIn link do not create an account with us. We do not run ads or a public directory
        of creators.
      </LegalP>

      <LegalH2>How you connect</LegalH2>
      <LegalP>
        Connection happens on Instagram, not on ReeledIn. You sign in on Instagram&apos;s page and approve
        two permissions: <span className="text-foreground">instagram_business_basic</span> and{" "}
        <span className="text-foreground">instagram_business_manage_insights</span>. We never see your
        Instagram password. Instagram returns a short-lived authorization code to our server; we
        exchange it there for a long-lived access token. That token stays on the server.
      </LegalP>

      <LegalH2>What we read from Instagram</LegalH2>
      <LegalP>
        From the connected account, on connect and on each later sync:
      </LegalP>
      <LegalList
        items={[
          "Instagram user id, username, account type, name, biography, and profile picture URL.",
          "Follower count and media count.",
          "Your 12 most recent posts: like count, comment count, media type, timestamp, caption (stored up to 600 characters), thumbnail or media URL, permalink, and view/play count when Instagram returns one.",
          "Account reach for the last 28 days, and a daily reach series for about the last 30 days.",
          "Follower demographics — age brackets, gender split, top cities and countries — only when the account has at least 100 followers and Instagram returns the data. These can lag up to 48 hours.",
        ]}
      />
      <LegalP>
        We do not read your password, direct messages, story inbox, or ad account. We cannot post,
        comment, or send messages on your behalf.
      </LegalP>

      <LegalH2>What we calculate ourselves</LegalH2>
      <LegalP>
        Engagement rate is calculated by ReeledIn, not returned by Instagram as a single metric. It is
        ((average likes + average comments) on those 12 posts ÷ follower count) × 100. Average reel
        views is the mean of view/play counts on recent reels. Daily engagement history uses the same
        formula against posts that existed on each day, with today&apos;s like, comment, and follower
        counts, because Instagram does not give us those historically.
      </LegalP>

      <LegalH2>What we store</LegalH2>
      <LegalList
        items={[
          "A ReeledIn user id and the time the account was created. The email field on that record is unused; we do not collect your email unless you write to us.",
          "The connected Instagram account fields listed above, last sync time, and any last sync error message.",
          "An encrypted long-lived Instagram access token and its expiry time (AES-256-GCM).",
          "Stats snapshots from each sync (followers, media count, engagement, average likes/comments, posts analyzed, recent-post JSON, 28-day reach).",
          "Daily insight rows (date, daily reach, derived daily engagement), upserted by day so later syncs overwrite rather than duplicate.",
          "Audience snapshots (age, gender, cities, countries) when Instagram returns them.",
          "Your public path (the Instagram handle, lowercased) and whether that path is visible.",
          "A signed, httpOnly session cookie so you can open /dashboard after connecting. It is not used for advertising.",
        ]}
      />

      <LegalH2>What appears on a public profile</LegalH2>
      <LegalP>
        New profiles are public by default. You can hide the link from the dashboard; a private link
        returns a not-found page to everyone else. A public profile shows your Instagram name, @handle,
        bio, profile photo, follower count, engagement rate, average reel views, monthly reach, 30-day
        charts, audience breakdowns when we have them, and the top recent post. It shows when the
        numbers were last synced. It does not show your access token, Instagram user id, ReeledIn user
        id, or raw API responses.
      </LegalP>
      <LegalP>
        The sample profile at /demo is fictional and labelled as such. It is not a real creator.
      </LegalP>

      <LegalH2>Why we retrieve this</LegalH2>
      <LegalP>
        So you can send a brand one live page instead of a screenshot. Sync (manual or a server job)
        refreshes the stored numbers from Instagram.
      </LegalP>

      <LegalH2>How long we keep it</LegalH2>
      <LegalP>
        For as long as the account stays connected. Each sync adds a stats snapshot; daily rows are
        updated in place. When you delete your ReeledIn account, or when Instagram tells us to delete
        it, we remove the user, the connected account, the encrypted token, every snapshot, daily
        rows, audience rows, and the public profile. After that the public link stops resolving.
      </LegalP>
      <LegalP>
        If you revoke access in Instagram but do not request deletion, we stop being able to refresh.
        Stored numbers stay until you delete the account. The freshness ring shows how old they are.
      </LegalP>

      <LegalH2>How to delete or disconnect</LegalH2>
      <LegalList
        items={[
          "From your ReeledIn dashboard, or from /data-deletion while signed in: Delete my ReeledIn. That removes everything listed above and signs you out.",
          "Email nine25ive.studios@gmail.com and ask us to delete the account for your Instagram handle.",
          "In Instagram: Settings → Apps and websites → remove ReeledIn and use Meta’s deletion request. Meta POSTs to our callback; we delete the matching account.",
        ]}
      />
      <LegalP>
        Instructions: <a className="text-foreground underline" href="/data-deletion">/data-deletion</a>.
        Meta’s machine callback is /api/data-deletion.
      </LegalP>

      <LegalH2>Sharing and processors</LegalH2>
      <LegalP>
        We do not sell your data. We do not share it with advertisers. People you give a public link
        to can see that public profile. We use these processors to run the app:
      </LegalP>
      <LegalList
        items={[
          "Meta / Instagram — login and the Graph API reads above.",
          "Neon — hosted Postgres for the records above.",
          "Vercel — hosts the website and serverless routes.",
        ]}
      />

      <LegalH2>Analytics and tracking</LegalH2>
      <LegalP>
        ReeledIn does not embed advertising pixels, Google Analytics, or a third-party session
        recorder. Vercel may log standard request metadata (path, status, timing) as part of hosting.
        We do not use that for marketing profiles.
      </LegalP>

      <LegalH2>Tokens and security</LegalH2>
      <LegalP>
        The Instagram access token is exchanged and refreshed only on the server. It is encrypted
        before it is written to the database. It is never sent to the browser, never put in a page
        URL, and never logged by our application code. The session cookie is httpOnly and, in
        production, Secure. App secrets live in server environment variables.
      </LegalP>

      <LegalH2>Children</LegalH2>
      <LegalP>
        ReeledIn is for Instagram Professional accounts. We do not knowingly offer the product to
        children under 13.
      </LegalP>

      <LegalH2>Contact</LegalH2>
      <LegalP>
        Questions about this policy or your data:{" "}
        <a className="text-foreground underline" href="mailto:nine25ive.studios@gmail.com">
        nine25ive.studios@gmail.com
        </a>
        . More on <a className="text-foreground underline" href="/contact">/contact</a>.
      </LegalP>
    </LegalPage>
  );
}
