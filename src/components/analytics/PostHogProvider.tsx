"use client";

import posthog from "posthog-js";
import { PostHogProvider as PostHogReactProvider } from "posthog-js/react";
import { useEffect } from "react";

/**
 * Initializes PostHog only when `NEXT_PUBLIC_POSTHOG_KEY` is set.
 * Without a key, children render unchanged (no network, no console noise).
 */
export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const host =
    process.env.NEXT_PUBLIC_POSTHOG_HOST?.trim() || "https://us.i.posthog.com";

  useEffect(() => {
    if (!key) return;
    if (posthog.__loaded) return;

    posthog.init(key, {
      api_host: host,
      capture_pageview: false,
      autocapture: false,
      disable_session_recording: true,
      persistence: "localStorage+cookie",
    });
  }, [key, host]);

  if (!key) {
    return <>{children}</>;
  }

  return <PostHogReactProvider client={posthog}>{children}</PostHogReactProvider>;
}
