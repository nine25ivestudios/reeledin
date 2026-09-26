import { SiteHeader } from "./SiteHeader";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border py-8 text-sm text-muted-foreground">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p>Verified, not self-reported.</p>
        <nav className="flex flex-wrap gap-x-4 gap-y-2" aria-label="Legal">
          <a className="hover:text-foreground" href="/privacy">
            Privacy
          </a>
          <a className="hover:text-foreground" href="/terms">
            Terms
          </a>
          <a className="hover:text-foreground" href="/data-deletion">
            Data deletion
          </a>
          <a className="hover:text-foreground" href="/contact">
            Contact
          </a>
        </nav>
      </div>
    </footer>
  );
}

type Width = "profile" | "wide" | "medium" | "narrow";

/** Centred content column; the header bar and page background stay full-bleed around it. */
const CONTAINER: Record<Width, string> = {
  profile: "mx-auto w-full max-w-[88rem] px-5 md:px-8 xl:px-10",
  wide: "mx-auto w-full max-w-6xl px-5",
  medium: "mx-auto w-full max-w-4xl px-5",
  narrow: "mx-auto w-full max-w-xl px-5",
};

export function PageShell({
  children,
  showConnect = true,
  width = "wide",
  headerNote,
}: {
  children: React.ReactNode;
  showConnect?: boolean;
  width?: Width;
  headerNote?: string;
}) {
  return (
    <div className="min-h-screen w-full overflow-x-clip">
      <SiteHeader showConnect={showConnect} note={headerNote} container={CONTAINER[width]} />
      <div className={CONTAINER[width]}>
        {children}
        <SiteFooter />
      </div>
    </div>
  );
}
