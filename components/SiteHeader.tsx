import Link from "next/link";
import { BrandMark } from "./BrandMark";

type Props = {
  showConnect?: boolean;
  note?: string;
};

export function SiteHeader({ showConnect = true, note }: Props) {
  return (
    <header className="sticky top-0 z-30 -mx-5 mb-2 border-b border-border bg-background/85 px-5 backdrop-blur">
      <div className="flex items-center justify-between gap-4 py-4">
        <Link href="/" className="flex items-center gap-2.5 font-display text-lg font-semibold tracking-tight text-foreground">
          <BrandMark />
          Reeledin
        </Link>
        <div className="flex items-center gap-4">
          {note ? <p className="hidden text-sm text-muted-foreground sm:block">{note}</p> : null}
          {showConnect ? (
            <a
              href="/api/auth/instagram"
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-[#0086dd]"
            >
              Connect Instagram
            </a>
          ) : null}
        </div>
      </div>
    </header>
  );
}
