import { PageShell } from "@/components/PageShell";

export const metadata = {
  title: "Connect Instagram — ReeledIn",
  description: "Connect an Instagram Professional account to create a verified ReeledIn profile.",
};

export default function ConnectPage() {
  return (
    <PageShell showConnect={false} width="medium">
      <div className="max-w-xl pb-10 pt-6">
        <p className="text-sm font-medium text-muted-foreground">Before you connect</p>
        <h1 className="mt-2 font-display text-3xl font-semibold leading-tight text-foreground sm:text-4xl">
          Connect your Instagram Professional account to create your verified ReeledIn profile.
        </h1>
        <p className="mt-4 text-muted-foreground">
          ReeledIn uses Instagram to fill your public stats page and keep the numbers current. You
          sign in on Instagram&apos;s page. We never see your password, and we cannot post or message
          for you.
        </p>

        <section className="mt-8 rounded-2xl border border-border bg-card p-5">
          <h2 className="font-display text-lg font-semibold text-foreground">What we ask Instagram for</h2>
          <dl className="mt-4 space-y-4 text-sm">
            <div>
              <dt className="font-medium text-foreground">instagram_business_basic</dt>
              <dd className="mt-1 text-muted-foreground">
                Username, name, bio, profile photo, account type, follower count, media count, and
                your recent posts (likes, comments, thumbnails, captions, permalinks, view counts
                when available).
              </dd>
            </div>
            <div>
              <dt className="font-medium text-foreground">instagram_business_manage_insights</dt>
              <dd className="mt-1 text-muted-foreground">
                Account reach and, if you have at least 100 followers, audience age, gender, and
                top locations. Engagement rate is calculated by ReeledIn from likes, comments, and
                followers — Instagram does not give us that number as a single field.
              </dd>
            </div>
          </dl>
        </section>

        <section className="mt-4 rounded-2xl border border-border bg-card p-5 text-sm text-muted-foreground">
          <p>
            The account must be a Business or Creator account. Personal accounts have no API access.
            You do not need a Facebook Page.
          </p>
          <p className="mt-3">
            After you approve, we create your page at reeledin.vercel.app/your_handle. It is public
            until you hide it in the dashboard. Read the{" "}
            <a className="text-foreground underline" href="/privacy">
              privacy policy
            </a>{" "}
            and{" "}
            <a className="text-foreground underline" href="/data-deletion">
              how to delete your data
            </a>
            .
          </p>
        </section>

        <a href="/api/auth/instagram" className="btn-primary mt-8 px-6 py-3">
          Continue to Instagram
        </a>
        <p className="mt-3 text-xs text-muted-foreground">
          You will leave ReeledIn and return here after you approve access.
        </p>
      </div>
    </PageShell>
  );
}
