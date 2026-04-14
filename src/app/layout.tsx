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

const siteName = "Planet Ponzi";
const siteDescription =
  "Un puzzle quotidien façon terminal de trading : manifeste, grille 4×4, cynisme spatial. Capitalisme orbital, un bâtiment à la fois.";

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
  keywords: ["puzzle", "jeu quotidien", "wordle", "satire", "grille"],
  authors: [{ name: "Planet Ponzi" }],
  openGraph: {
    type: "website",
    locale: "fr_FR",
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
  themeColor: [{ media: "(prefers-color-scheme: dark)", color: "#050506" }],
  colorScheme: "dark",
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
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} h-full`}
    >
      <body className="flex min-h-full flex-col bg-pp-bg text-pp-text">
        {children}
      </body>
    </html>
  );
}
