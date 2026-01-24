import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { RootProvider } from "fumadocs-ui/provider/next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Notion-Google Calendar Sync | Bidirectional Real-time Sync",
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
  ],
  authors: [{ name: "mcsdevv" }],
  openGraph: {
    title: "Notion-Google Calendar Sync",
    description: "Bidirectional, real-time sync between Notion and Google Calendar",
    type: "website",
    url: "https://notion-gcal-sync.com",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Notion-Google Calendar Sync",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Notion-Google Calendar Sync",
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
      </body>
    </html>
  );
}
