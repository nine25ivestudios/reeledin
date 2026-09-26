import { DeleteAccountButton } from "@/components/DeleteAccountButton";
import { LegalH2, LegalList, LegalP, LegalPage } from "@/components/LegalPage";
import { getSessionUserId } from "@/lib/session";

export const metadata = { title: "Data deletion — ReeledIn" };
export const dynamic = "force-dynamic";

export default async function DataDeletionPage() {
  const signedIn = Boolean(await getSessionUserId());

  return (
    <LegalPage title="Data deletion" updated="26 September 2026">
      <LegalP>
        You can remove your ReeledIn account, the public profile, stored Instagram stats, daily
        history, audience snapshots, and the encrypted Instagram access token. After deletion the
        public link stops working.
      </LegalP>

      <LegalH2>1. Delete it yourself (signed in)</LegalH2>
      {signedIn ? (
        <>
          <LegalP>
            This permanently deletes the ReeledIn user tied to this browser session and everything
            stored for that Instagram account.
          </LegalP>
          <div className="mt-4">
            <DeleteAccountButton className="btn-secondary px-4 py-2 text-sm text-destructive" />
          </div>
        </>
      ) : (
        <LegalP>
          Sign in with Connect Instagram, then return here or open the dashboard. The same control
          appears under your public-link settings.
        </LegalP>
      )}

      <LegalH2>2. Email us</LegalH2>
      <LegalP>
        Write to{" "}
        <a className="text-foreground underline" href="mailto:nine25ive.studios@gmail.com?subject=ReeledIn%20data%20deletion">
        nine25ive.studios@gmail.com
        </a>{" "}
        from any address. Include the Instagram username you connected and ask us to delete the
        ReeledIn account. We delete the same records as the button above.
      </LegalP>

      <LegalH2>3. Through Instagram / Meta</LegalH2>
      <LegalList
        items={[
          "In the Instagram app: Settings → Apps and websites → find ReeledIn → remove access, then use Meta’s “request deletion” flow if it is offered.",
          "Meta sends a signed request to our callback at /api/data-deletion. We verify it, delete the matching connected account and user, and return a confirmation URL.",
          "That confirmation opens /deletion-status with a one-time code.",
        ]}
      />
      <LegalP>
        /api/data-deletion is the machine callback for App Review. This page is the human
        instructions.
      </LegalP>

      <LegalH2>What is deleted</LegalH2>
      <LegalList
        items={[
          "ReeledIn user record and session.",
          "Connected Instagram account row, including the encrypted access token.",
          "Stats snapshots, daily insight rows, and audience snapshots.",
          "The public profile and its handle.",
        ]}
      />
      <LegalP>
        We cannot delete data that only exists on Instagram. Revoking the app there stops future
        syncs; deleting here removes what ReeledIn stored.
      </LegalP>
    </LegalPage>
  );
}
