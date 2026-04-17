import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteName = "Planet Ponzi Saga";
const siteDescription =
  "Le puzzle spatial addictif : grille 4×4, niveaux Saga, étoiles et progression sur la carte. Bâtissez, optimisez, progressez — PWA jouable hors-ligne.";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://planetponzi.vercel.app/",
  ),
  applicationName: siteName,
  title: {
    default: siteName,
    template: `%s · ${siteName}`,
  },
  description: siteDescription,
  keywords: ["puzzle", "jeu mobile", "PWA", "Saga", "grille", "casual", "spatial"],
  authors: [{ name: "Planet Ponzi" }],
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: siteName,
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "/",
    siteName,
    title: siteName,
    description: siteDescription,
  },
  twitter: {
    card: "summary_large_image",
    title: siteName,
    description: siteDescription,
  },
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    apple: "/icon.svg",
  },
  manifest: "/manifest.json",
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: [{ media: "(prefers-color-scheme: light)", color: "#7c3aed" }],
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${geistSans.variable} ${geistMono.variable} h-full`}>
      <body className="flex min-h-dvh justify-center bg-slate-950 text-slate-200 antialiased">
        <main
          className="relative mx-auto flex h-[100dvh] w-full max-w-md flex-col overflow-hidden bg-pp-bg text-pp-text shadow-2xl [transform:translateZ(0)]"
          id="pp-game-shell"
        >
          <div className="flex min-h-0 min-w-0 flex-1 flex-col">{children}</div>
        </main>
      </body>
    </html>
  );
}
