import type { Metadata } from "next";
import { Anton, Plus_Jakarta_Sans, IBM_Plex_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

const anton = Anton({
  variable: "--font-display-raw",
  weight: "400",
  subsets: ["latin"],
});

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-sans-raw",
  subsets: ["latin"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-mono-raw",
  weight: ["400", "500", "600"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TradeQuest — Read the chart. Not the news.",
  description:
    "Replay real historical crypto markets one candle at a time, call buy, sell or wait, and build the habit with daily streaks and XP. Free, launching soon.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${anton.variable} ${plusJakartaSans.variable} ${ibmPlexMono.variable}`}
      style={
        {
          "--font-display": "var(--font-display-raw), sans-serif",
          "--font-sans": "var(--font-sans-raw), sans-serif",
          "--font-mono": "var(--font-mono-raw), monospace",
        } as React.CSSProperties
      }
    >
      <body>
        <ClerkProvider>{children}</ClerkProvider>
      </body>
    </html>
  );
}
