import { LegalP, LegalPage } from "@/components/LegalPage";

export const metadata = { title: "Contact — ReeledIn" };

export default function ContactPage() {
  return (
    <LegalPage title="Contact">
      <LegalP>
        ReeledIn is run by a small team. The inbox for support, privacy questions, and deletion
        requests is the same:
      </LegalP>
      <p className="mt-6">
        <a href="mailto:nine25ive.studios@gmail.com" className="btn-primary px-5 py-3 text-sm">
        nine25ive.studios@gmail.com
        </a>
      </p>
      <LegalP>
        For a deletion request, include the Instagram username you connected (for example
        @shaun_fern) and say that you want the ReeledIn account removed. We delete the connected
        account, encrypted token, stored stats, and public profile.
      </LegalP>
      <LegalP>
        If you are already signed in, you can also delete the account yourself on{" "}
        <a className="text-foreground underline" href="/data-deletion">
          /data-deletion
        </a>{" "}
        or from the dashboard.
      </LegalP>
    </LegalPage>
  );
}
