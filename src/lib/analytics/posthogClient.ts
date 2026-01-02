import posthog from "posthog-js";

let initialized = false;

export function initPostHog() {
  if (typeof window === "undefined") return;
  if (initialized) return;

  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST;

  if (!key) {
    console.warn("PostHog key not configured");
    return;
  }

  posthog.init(key, {
    api_host: host || "https://app.posthog.com",
    capture_pageview: true,
    capture_pageleave: true,
    autocapture: true,
    persistence: "localStorage",
    loaded: (posthog) => {
      if (process.env.NODE_ENV === "development") {
        // Disable in development unless explicitly enabled
        // posthog.opt_out_capturing();
      }
    },
  });

  initialized = true;
}

export function identifyUser(userId: string, properties?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  posthog.identify(userId, properties);
}

export function resetUser() {
  if (typeof window === "undefined") return;
  posthog.reset();
}

export function captureEvent(
  eventName: string,
  properties?: Record<string, unknown>
) {
  if (typeof window === "undefined") return;
  posthog.capture(eventName, properties);
}

export { posthog };
