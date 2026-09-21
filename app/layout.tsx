import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Grain } from "@/components/Grain";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Reeledin — verified Instagram stats for creators",
  description:
    "Verified, not self-reported. Connect Instagram once and send brands a live public credential instead of a screenshot.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <link
          href="https://api.fontshare.com/v2/css?f[]=general-sans@500,600,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-background font-sans text-foreground antialiased">
        <div className="pointer-events-none fixed inset-0 z-0 isolate">
          <Grain />
        </div>
        <div className="relative z-10">{children}</div>
      </body>
    </html>
  );
}
