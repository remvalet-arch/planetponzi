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
  /** OG statique `/og-image.png` → image générée (`opengraph-image.tsx`) tant que l’asset PNG n’est pas fourni. */
  async rewrites() {
    return [{ source: "/og-image.png", destination: "/opengraph-image" }];
  },
};

export default withSerwist(nextConfig);
