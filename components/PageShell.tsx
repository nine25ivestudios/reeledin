import { SiteHeader } from "./SiteHeader";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border py-8 text-sm text-muted-foreground">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p>Verified, not self-reported.</p>
        <div className="flex gap-4">
          <a className="hover:text-foreground" href="/privacy">
            Privacy
          </a>
          <a className="hover:text-foreground" href="/api/data-deletion">
            Data deletion
          </a>
        </div>
      </div>
    </footer>
  );
}

type Width = "wide" | "medium" | "narrow";

const WIDTH: Record<Width, string> = {
  wide: "max-w-6xl",
  medium: "max-w-4xl",
  narrow: "max-w-xl",
};

export function PageShell({
  children,
  showConnect = true,
  width = "wide",
}: {
  children: React.ReactNode;
  showConnect?: boolean;
  width?: Width;
}) {
  return (
    <div className={`mx-auto min-h-screen w-full ${WIDTH[width]} px-5`}>
      <SiteHeader showConnect={showConnect} />
      {children}
      <SiteFooter />
    </div>
  );
}
