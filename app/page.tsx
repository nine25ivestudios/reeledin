import Link from "next/link";
import { BrandPreview } from "@/components/landing/BrandPreview";
import { Faq } from "@/components/landing/Faq";
import { HeroCredential } from "@/components/HeroCredential";
import { HeroHeadline } from "@/components/landing/HeroHeadline";
import { PageShell } from "@/components/PageShell";

export const dynamic = "force-dynamic";

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

const SCREENSHOT_STORY = [
  "A brand asks for your stats.",
  "You open Instagram Insights.",
  "You screenshot them.",
  "You crop them.",
  "You send them.",
];

const STEPS = [
  { n: "01", title: "Connect", body: "Connect your Instagram account securely." },
  { n: "02", title: "Verify", body: "Your profile is populated from your connected account." },
  { n: "03", title: "Share", body: "Send one link whenever a brand asks for your numbers." },
];

const FAQ = [
  {
    q: "Is ReeledIn free?",
    a: "Yes. Your media kit shouldn't cost you another subscription. Connecting Instagram, getting your live profile and sharing your link are free. There is no paid plan.",
  },
  {
    q: "Which Instagram accounts can connect?",
    a: "Instagram Business and Creator accounts. Instagram doesn't share stats from personal accounts with apps, so switch your account type in Instagram's settings first. You don't need a Facebook Page. Audience age, gender and location appear once an account has at least 100 followers.",
  },
  {
    q: "Does ReeledIn access my Instagram password?",
    a: "No. You sign in on Instagram's own page and approve access there. ReeledIn only asks for permission to read your basic profile and insights, so it can't post or send messages. It receives an access token, never your password, and stores that token encrypted.",
  },
  {
    q: "Can I edit the numbers on my profile?",
    a: "No. Followers, engagement, reach, audience and content stats come from your connected account, and there is no way to type or change them. Your name and bio also come from your Instagram profile. You choose whether your public link is visible.",
  },
  {
    q: "What happens if I disconnect my Instagram account?",
    a: "If you remove ReeledIn in Instagram's Apps and websites settings and request deletion, Instagram notifies us and we delete your account, access token, stats, audience data and profile, so your link stops working. You can also request deletion by emailing hello@reeledin.com. Until then, if access stops, your numbers stop updating and the freshness ring on your profile shows how long ago they were last synced.",
  },
];

export default function HomePage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  const error = searchParams.error ? ERRORS[searchParams.error] ?? searchParams.error : null;

  return (
    <PageShell width="wide">
      {error ? (
        <p className="mb-6 mt-4 rounded-xl border border-border bg-card px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <section className="grid items-center gap-12 pt-10 lg:grid-cols-2 lg:gap-16 sm:pt-16">
        <div>
          <HeroHeadline />
          <p className="mt-5 max-w-xl text-lg text-muted-foreground">
            Connect Instagram once. ReeledIn keeps your stats updated automatically. When a brand asks for your
            numbers, send one link.
          </p>
          <div className="mt-8 flex gap-2 text-[13px] min-[360px]:text-sm min-[400px]:text-[15px] sm:gap-3 sm:text-base">
            <a
              href="/api/auth/instagram"
              className="btn-primary min-w-0 flex-1 px-2.5 py-3 min-[400px]:px-3 sm:flex-none sm:px-5"
            >
              Create my ReeledIn
            </a>
            <Link
              href="/demo"
              className="btn-secondary min-w-0 flex-1 px-2.5 py-3 min-[400px]:px-3 sm:flex-none sm:px-5"
            >
              See a sample profile
            </Link>
          </div>
        </div>
        <HeroCredential />
      </section>

      <section className="mt-28 grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
        <h2 className="max-w-md font-display text-3xl font-semibold leading-tight text-foreground sm:text-5xl">
          Your numbers shouldn&apos;t live in a screenshot.
        </h2>
        <div>
          <ol className="space-y-2 text-lg text-muted-foreground">
            {SCREENSHOT_STORY.map((line) => (
              <li key={line}>{line}</li>
            ))}
            <li className="pt-2 text-foreground">Three months later, the screenshot is already outdated.</li>
          </ol>
          <p className="mt-8 border-l border-border pl-5 text-lg text-foreground">
            ReeledIn gives you one profile that stays connected to your account and keeps your numbers current.
          </p>
        </div>
      </section>

      <section className="mt-28">
        <p className="text-sm font-medium text-muted-foreground">How it works</p>
        <div className="mt-6 grid gap-6 sm:grid-cols-3">
          {STEPS.map((step) => (
            <div
              key={step.n}
              className="rounded-2xl border border-border bg-card p-5 transition duration-200 hover:-translate-y-0.5 hover:border-white/20"
            >
              <p className="font-display text-sm tabular-nums text-verified">{step.n}</p>
              <h3 className="mt-2 font-display text-xl font-semibold text-foreground">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      <BrandPreview />

      <section className="mt-28">
        <div className="grid gap-8 lg:grid-cols-[1fr_2fr] lg:gap-16">
          <h2 className="font-display text-3xl font-semibold text-foreground sm:text-4xl">Questions</h2>
          <Faq items={FAQ} />
        </div>
      </section>

      <section className="mt-28 rounded-2xl border border-border bg-card px-6 py-14 text-center sm:px-10">
        <h2 className="mx-auto max-w-3xl font-display text-3xl font-semibold leading-tight text-foreground sm:text-5xl">
          The next time a brand asks for your stats, don&apos;t send a screenshot.
        </h2>
        <a href="/api/auth/instagram" className="btn-primary mt-8 px-6 py-3">
          Create your ReeledIn
        </a>
        <p className="mt-4 text-sm text-muted-foreground">Connect once. Share forever.</p>
      </section>
    </PageShell>
  );
}
