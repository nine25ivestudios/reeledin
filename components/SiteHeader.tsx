import Link from "next/link";
import { BrandMark } from "./BrandMark";

type Props = {
  showConnect?: boolean;
  note?: string;
  /** Same column classes as the page body, so the logo and CTA line up with the content. */
  container: string;
};

export function SiteHeader({ showConnect = true, note, container }: Props) {
  return (
    <header className="site-header sticky top-0 z-30 mb-2 border-b border-border bg-background/85 backdrop-blur">
      <div className={`${container} flex items-center justify-between gap-4 py-4`}>
        <Link href="/" className="flex items-center gap-2.5 font-display text-lg font-semibold tracking-tight text-foreground">
          <BrandMark />
          Reeledin
        </Link>
        <div className="flex items-center gap-4">
          {note ? <p className="hidden text-sm text-muted-foreground sm:block">{note}</p> : null}
          {showConnect ? (
            <a
              href="/connect"
              className="btn-primary px-4 py-2 text-sm"
            >
              Connect Instagram
            </a>
          ) : null}
        </div>
      </div>
    </header>
  );
}
