import posthog from "posthog-js";

function isConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_POSTHOG_KEY);
}

/**
 * Fire-and-forget analytics; no-ops when PostHog is not configured or not in the browser.
 * Safe to call from Zustand after the app shell has mounted (init runs in PostHogProvider).
 */
export function captureGameEvent(
  event: "level_started" | "level_completed" | "level_failed",
  props: Record<string, unknown>,
): void {
  if (!isConfigured() || typeof window === "undefined") return;
  try {
    posthog.capture(event, props);
  } catch {
    /* silent — dev without keys or before init */
  }
}
