import type { Metadata } from "next";
import { DM_Sans, Inter } from "next/font/google";
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

export const metadata: Metadata = {
  title: "Reeledin — verified Instagram stats for creators",
  description:
    "Verified, not self-reported. Connect Instagram once and send brands a live public credential instead of a screenshot.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${dmSans.variable}`}>
      <head>
        {/* Windows has no flag emoji glyphs; this font covers regional-indicator pairs. */}
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Color+Emoji&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="relative bg-background font-sans text-foreground antialiased">
        <div className="relative z-10">{children}</div>
        <div className="pointer-events-none fixed inset-0 z-[100]" aria-hidden="true">
          <Grain />
        </div>
      </body>
    </html>
  );
}
