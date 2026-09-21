import { PageShell } from "@/components/PageShell";

export default function NotFound() {
  return (
    <PageShell showConnect width="narrow">
      <h1 className="font-display text-3xl font-semibold text-foreground">This profile is not public</h1>
      <p className="mt-3 text-muted-foreground">
        No Reeledin credential exists at this URL. If you are the creator, connect Instagram and
        copy your public link from the dashboard.
      </p>
    </PageShell>
  );
}
