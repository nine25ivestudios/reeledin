import { Leaderboard } from "@/components/Leaderboard";
import { PageShell } from "@/components/PageShell";
import { RecentlyVerified } from "@/components/RecentlyVerified";
import { HeroCredential } from "@/components/HeroCredential";
import { VerifiedCheck } from "@/components/BrandMark";

const ERRORS: Record<string, string> = {
  session: "Connect Instagram to open your dashboard.",
  denied:
    "You cancelled Instagram access. Connect again when you want Reeledin to pull your stats.",
  csrf: "This connect attempt expired or did not match. Start again from Connect Instagram.",
  missing_code: "Instagram did not send an authorization code. Connect Instagram again.",
  personal:
    "Instagram only shares stats for Business or Creator accounts. Switch your account type in Instagram, then connect again.",
  config: "Reeledin is missing Instagram app credentials on the server. Add them to .env and restart.",
};

export default function HomePage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  const error = searchParams.error ? ERRORS[searchParams.error] ?? searchParams.error : null;

  return (
    <PageShell width="wide">
      {error ? (
        <p className="mb-6 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <section className="grid items-center gap-12 pt-10 lg:grid-cols-2 lg:gap-16 sm:pt-16">
        <div>
          <p className="inline-flex items-center gap-2 text-sm font-medium text-verified">
            <VerifiedCheck />
            Verified, not self-reported.
          </p>
          <h1 className="mt-4 max-w-xl font-display text-4xl font-semibold leading-tight text-foreground sm:text-6xl">
            Your Instagram, as a professional credential.
          </h1>
          <p className="mt-5 max-w-xl text-lg text-muted-foreground">
            Connect once. Send brands <span className="text-foreground">reeledin.com/your-handle</span>{" "}
            instead of a screenshot or a stale PDF. Stats come from Instagram&apos;s API and stay
            current.
          </p>
          <a
            href="/api/auth/instagram"
            className="mt-8 inline-block rounded-lg bg-primary px-5 py-3 font-medium text-white hover:bg-[#0086dd]"
          >
            Connect Instagram
          </a>
        </div>
        <HeroCredential />
      </section>

      <section className="mt-20 grid gap-6 sm:grid-cols-3">
        {[
          {
            n: "1",
            title: "Connect Instagram",
            body: "Business Login — no Facebook Page required. Your account must be Business or Creator. Personal accounts have no API access; switch the account type in Instagram first.",
          },
          {
            n: "2",
            title: "Verify",
            body: "We pull followers, engagement, and audience demographics from Instagram. You do not type the numbers.",
          },
          {
            n: "3",
            title: "Share",
            body: "Copy your public link. Brands open a live record, not a crop of Insights.",
          },
        ].map((step) => (
          <div
            key={step.n}
            className="rounded-2xl border border-border bg-card p-5 transition duration-200 hover:-translate-y-0.5 hover:border-white/20"
          >
            <p className="font-display text-sm text-verified">{step.n}</p>
            <h2 className="mt-2 font-display text-xl font-semibold text-foreground">{step.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
          </div>
        ))}
      </section>

      <RecentlyVerified />
      <Leaderboard />
    </PageShell>
  );
}
