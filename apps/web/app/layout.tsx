import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { RootProvider } from "fumadocs-ui/provider/next";
import { GeistSans } from "geist/font/sans";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://while.so"),
  title: "While | Sync Notion & Google Calendar",
  description:
    "Keep your Notion calendar database and Google Calendar in perfect sync. Bidirectional, real-time, self-hosted. Free and open source.",
  keywords: [
    "notion",
    "google calendar",
    "sync",
    "automation",
    "calendar sync",
    "bidirectional sync",
    "self-hosted",
    "while",
  ],
  authors: [{ name: "mcsdevv" }],
  openGraph: {
    title: "While | Sync Notion & Google Calendar",
    description: "Bidirectional, real-time sync between Notion and Google Calendar",
    type: "website",
    url: "https://while.so",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "While",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "While | Sync Notion & Google Calendar",
    description: "Bidirectional, real-time sync between Notion and Google Calendar",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${GeistSans.className} flex flex-col min-h-screen antialiased`}>
        <RootProvider>{children}</RootProvider>
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
