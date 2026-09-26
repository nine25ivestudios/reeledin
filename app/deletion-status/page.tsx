import { PageShell } from "@/components/PageShell";
import { hmacVerify } from "@/lib/crypto";

export const dynamic = "force-dynamic";

export default function DeletionStatusPage({
  searchParams,
}: {
  searchParams: { code?: string; sig?: string };
}) {
  const code = searchParams.code ?? "";
  const sig = searchParams.sig ?? "";
  const valid = Boolean(code && sig && hmacVerify(code, sig));

  return (
    <PageShell showConnect={false} width="medium">
      <h1 className="font-display text-3xl font-semibold text-foreground">Data deletion</h1>
      {!valid ? (
        <p className="mt-4 text-destructive">
          This confirmation link is invalid. If you requested deletion from Instagram, wait a few
          minutes and open the status URL Meta provided, or follow{" "}
          <a className="underline" href="/data-deletion">
            /data-deletion
          </a>
          .
        </p>
      ) : (
        <p className="mt-4 text-muted-foreground">
          Request <span className="font-mono text-foreground">{code}</span> is complete. Instagram
          account data tied to that request has been deleted from Reeledin.
        </p>
      )}
    </PageShell>
  );
}
