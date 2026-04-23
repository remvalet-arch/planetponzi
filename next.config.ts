import { randomUUID } from "node:crypto";

import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";

const offlineRevision =
  process.env.VERCEL_GIT_COMMIT_SHA?.trim() || process.env.npm_package_version || randomUUID();

const withSerwist = withSerwistInit({
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
  /** Page de repli navigation (hors-ligne). */
  additionalPrecacheEntries: [{ url: "/~offline", revision: offlineRevision }],
});

const nextConfig: NextConfig = {
  /**
   * `/og-image.png` → image dynamique tant qu’aucun PNG statique n’est servi depuis `public/`.
   * Le partage social utilise `/og-image.jpg` (fichier dans `public/`, remplaçable par le client).
   */
  async rewrites() {
    return [{ source: "/og-image.png", destination: "/opengraph-image" }];
  },
};

export default withSerwist(nextConfig);
