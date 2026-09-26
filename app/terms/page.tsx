import { LegalH2, LegalList, LegalP, LegalPage } from "@/components/LegalPage";

export const metadata = { title: "Terms of Service — ReeledIn" };

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Service" updated="26 September 2026">
      <LegalP>
        These terms cover use of ReeledIn at reeledin.vercel.app. By connecting Instagram or using a
        public profile, you agree to them. If you do not agree, do not connect.
      </LegalP>

      <LegalH2>The service</LegalH2>
      <LegalP>
        ReeledIn lets a creator connect an Instagram Professional account and get a live stats page
        to send to brands. The product is free. There is no paid plan today.
      </LegalP>

      <LegalH2>Your account</LegalH2>
      <LegalList
        items={[
          "You must use an Instagram Business or Creator account you are allowed to connect. Personal accounts cannot authorize the API.",
          "You authorize ReeledIn to read the profile, media, and insights described in the privacy policy, using Instagram Login.",
          "Numbers on the page come from Instagram or from the formulas we disclose. You cannot type over them.",
          "Your public path is your Instagram handle. New profiles are public until you hide the link in the dashboard.",
        ]}
      />

      <LegalH2>Acceptable use</LegalH2>
      <LegalP>
        Do not connect an account you do not control, abuse the sync endpoint, attempt to access
        another creator’s dashboard, or use ReeledIn to misrepresent stats. We may disconnect an
        account that breaks these terms or Instagram’s terms.
      </LegalP>

      <LegalH2>Instagram’s terms</LegalH2>
      <LegalP>
        Instagram is provided by Meta. Your use of Instagram remains under Meta’s terms and privacy
        policy. ReeledIn is not affiliated with Meta. If Instagram changes or withdraws an insight,
        that field may disappear or show as unavailable.
      </LegalP>

      <LegalH2>Availability</LegalH2>
      <LegalP>
        The service is provided as-is. Syncs can fail when Instagram is unavailable, when a token
        expires, or when a permission is missing. We do not warrant uninterrupted access or that
        every insight will always be present.
      </LegalP>

      <LegalH2>Liability</LegalH2>
      <LegalP>
        ReeledIn is a small product offered at no charge. To the extent the law allows, we are not
        liable for lost deals, outdated screenshots someone else still has, or Instagram API
        outages. Nothing here limits rights you cannot waive.
      </LegalP>

      <LegalH2>Ending the service</LegalH2>
      <LegalP>
        You can delete your ReeledIn data at any time from the dashboard, from{" "}
        <a className="text-foreground underline" href="/data-deletion">
          /data-deletion
        </a>
        , by emailing nine25ive.studios@gmail.com, or through Instagram’s Apps and websites deletion flow. We
        may stop offering the product.
      </LegalP>

      <LegalH2>Contact</LegalH2>
      <LegalP>
        <a className="text-foreground underline" href="mailto:nine25ive.studios@gmail.com">
        nine25ive.studios@gmail.com
        </a>
      </LegalP>
    </LegalPage>
  );
}
