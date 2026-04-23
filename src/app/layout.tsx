import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { PostHogProvider } from "@/src/components/analytics/PostHogProvider";
import { PassiveIncomeLoopProvider } from "@/src/components/providers/PassiveIncomeLoopProvider";
import { CloudSaveSyncProvider } from "@/src/components/settings/CloudSaveSyncProvider";
import { InstallAppBanner } from "@/src/components/pwa/InstallAppBanner";

import {
  OG_TITLE,
  SITE_DESCRIPTION,
  SITE_METADATA_TITLE,
  SITE_NAME_SHORT,
} from "@/src/lib/site-metadata-copy";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://planetponzi.vercel.app/",
  ),
  applicationName: SITE_NAME_SHORT,
  title: {
    default: SITE_METADATA_TITLE,
    template: `%s · ${SITE_NAME_SHORT}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "puzzle",
    "jeu mobile",
    "PWA",
    "réflexion",
    "capitalisme",
    "grille",
    "casual",
    "spatial",
    "Planète Ponzi",
    "open graph",
  ],
  authors: [{ name: "Planète Ponzi", url: "https://planetponzi.vercel.app/" }],
  creator: "Planète Ponzi",
  publisher: "Planète Ponzi",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: SITE_NAME_SHORT,
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    alternateLocale: ["en_US"],
    url: "/",
    siteName: SITE_NAME_SHORT,
    title: OG_TITLE,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: OG_TITLE,
        type: "image/jpeg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: OG_TITLE,
    description: SITE_DESCRIPTION,
    images: ["/og-image.jpg"],
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icon-192x192.png", sizes: "192x192", type: "image/png" }],
  },
  manifest: "/manifest.json",
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#020617",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${geistSans.variable} ${geistMono.variable} h-full`}>
      <body className="flex min-h-0 min-h-dvh w-full justify-center overflow-hidden overscroll-y-none bg-zinc-950 text-slate-200 antialiased">
        <main
          className="relative flex h-[100dvh] min-h-0 w-full max-w-md flex-col overflow-hidden overscroll-y-none bg-pp-bg text-pp-text shadow-2xl ring-1 ring-black/15 [transform:translateZ(0)] sm:my-2 sm:max-h-[min(100dvh,56rem)] sm:rounded-3xl"
          id="pp-game-shell"
        >
          <div className="scanlines" aria-hidden />
          <div className="relative z-[40] flex min-h-0 min-w-0 flex-1 flex-col">
            <PostHogProvider>
              <CloudSaveSyncProvider>
                <PassiveIncomeLoopProvider>{children}</PassiveIncomeLoopProvider>
              </CloudSaveSyncProvider>
            </PostHogProvider>
            <InstallAppBanner />
          </div>
        </main>
      </body>
    </html>
  );
}
