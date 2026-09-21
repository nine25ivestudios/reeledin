import { PageShell } from "@/components/PageShell";

export const metadata = { title: "Privacy — Reeledin" };

export default function PrivacyPage() {
  return (
    <PageShell showConnect={false} width="medium">
      <article className="max-w-2xl">
        <h1 className="font-display text-3xl font-semibold text-foreground">Privacy policy</h1>
        <p className="mt-4 text-muted-foreground">
          Reeledin pulls Instagram professional-account stats on your behalf so you can share a
          live public credential with brands. Verified, not self-reported.
        </p>
        <h2 className="mt-8 font-display text-xl text-foreground">What we collect</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-muted-foreground">
          <li>Your Instagram-scoped user ID, username, and account type.</li>
          <li>Follower count, media count, and like/comment counts on recent posts.</li>
          <li>
            Audience demographics (age, gender, top cities/countries) when Instagram returns them —
            only for the authenticated account, and only at or above 100 followers.
          </li>
          <li>A long-lived Instagram access token, AES-encrypted at rest.</li>
          <li>Optional profile copy you type: display name, niche, bio, public/private.</li>
        </ul>
        <h2 className="mt-8 font-display text-xl text-foreground">How we use it</h2>
        <p className="mt-3 text-muted-foreground">
          We use this data to show you a private dashboard and, if your profile is public, a page at
          reeledin.com/your-handle. We do not sell your data. We do not publish a searchable
          directory of connected creators.
        </p>
        <h2 className="mt-8 font-display text-xl text-foreground">Retention and deletion</h2>
        <p className="mt-3 text-muted-foreground">
          When you request deletion through Instagram / Meta, or by emailing hello@reeledin.com, we
          delete your user record, connected accounts, tokens, stats snapshots, audience snapshots,
          and profile. Meta data-deletion callbacks are handled at /api/data-deletion.
        </p>
      </article>
    </PageShell>
  );
}
