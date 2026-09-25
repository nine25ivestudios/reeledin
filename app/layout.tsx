import type { Metadata } from "next";
import { DM_Sans, Inter, Noto_Color_Emoji } from "next/font/google";
import { Grain } from "@/components/Grain";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-dm-sans",
  display: "swap",
});

/* Windows has no flag emoji glyphs; this covers regional-indicator pairs. Not preloaded: only fetched when a flag renders. */
const emoji = Noto_Color_Emoji({
  weight: "400",
  subsets: ["emoji"],
  variable: "--font-emoji",
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  title: "Reeledin — verified Instagram stats for creators",
  description:
    "Verified, not self-reported. Connect Instagram once and send brands a live public credential instead of a screenshot.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${dmSans.variable} ${emoji.variable}`}>
      <body className="relative bg-background font-sans text-foreground antialiased">
        <div className="relative z-10">{children}</div>
        <div className="grain-layer pointer-events-none fixed inset-0 z-[100]" aria-hidden="true">
          <Grain />
        </div>
      </body>
    </html>
  );
}
