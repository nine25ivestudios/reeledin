import { PageShell } from "./PageShell";

export function LegalPage({
  title,
  updated,
  children,
}: {
  title: string;
  updated?: string;
  children: React.ReactNode;
}) {
  return (
    <PageShell showConnect={false} width="medium">
      <article className="max-w-2xl pb-10">
        <h1 className="font-display text-3xl font-semibold text-foreground">{title}</h1>
        {updated ? <p className="mt-2 text-sm text-muted-foreground">Last updated {updated}</p> : null}
        {children}
      </article>
    </PageShell>
  );
}

export function LegalH2({ children }: { children: React.ReactNode }) {
  return <h2 className="mt-8 font-display text-xl text-foreground">{children}</h2>;
}

export function LegalP({ children }: { children: React.ReactNode }) {
  return <p className="mt-3 text-muted-foreground">{children}</p>;
}

export function LegalList({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="mt-3 list-disc space-y-2 pl-5 text-muted-foreground">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
}
