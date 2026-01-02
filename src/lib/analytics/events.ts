import { captureEvent } from "./posthogClient";

// Event names as constants for consistency
export const EVENTS = {
  SIGNUP_COMPLETED: "signup_completed",
  ONBOARDING_COMPLETED: "onboarding_completed",
  SCENARIO_STARTED: "scenario_started",
  OPTION_SELECTED: "option_selected",
  SCENARIO_COMPLETED: "scenario_completed",
  PAYWALL_VIEWED: "paywall_viewed",
  CHECKOUT_STARTED: "checkout_started",
  SUBSCRIPTION_ACTIVATED: "subscription_activated",
} as const;

// Typed event tracking functions
export function trackSignupCompleted(userId: string, method: string) {
  captureEvent(EVENTS.SIGNUP_COMPLETED, {
    user_id: userId,
    method,
  });
}

export function trackOnboardingCompleted(
  userId: string,
  profile: {
    role?: string;
    level?: string;
    industry?: string;
    company_size?: string;
  }
) {
  captureEvent(EVENTS.ONBOARDING_COMPLETED, {
    user_id: userId,
    ...profile,
  });
}

export function trackScenarioStarted(
  userId: string,
  scenarioId: string,
  scenarioSlug: string,
  sessionId: string
) {
  captureEvent(EVENTS.SCENARIO_STARTED, {
    user_id: userId,
    scenario_id: scenarioId,
    scenario_slug: scenarioSlug,
    session_id: sessionId,
  });
}

export function trackOptionSelected(
  userId: string,
  sessionId: string,
  nodeKey: string,
  optionKey: string,
  stepIndex: number
) {
  captureEvent(EVENTS.OPTION_SELECTED, {
    user_id: userId,
    session_id: sessionId,
    node_key: nodeKey,
    option_key: optionKey,
    step_index: stepIndex,
  });
}

export function trackScenarioCompleted(
  userId: string,
  sessionId: string,
  scenarioId: string,
  readinessScore: number,
  pathLength: number
) {
  captureEvent(EVENTS.SCENARIO_COMPLETED, {
    user_id: userId,
    session_id: sessionId,
    scenario_id: scenarioId,
    readiness_score: readinessScore,
    path_length: pathLength,
  });
}

export function trackPaywallViewed(
  userId: string,
  reason: string,
  context?: string
) {
  captureEvent(EVENTS.PAYWALL_VIEWED, {
    user_id: userId,
    reason,
    context,
  });
}

export function trackCheckoutStarted(
  userId: string,
  priceId: string,
  plan: "monthly" | "annual"
) {
  captureEvent(EVENTS.CHECKOUT_STARTED, {
    user_id: userId,
    price_id: priceId,
    plan,
  });
}

export function trackSubscriptionActivated(
  userId: string,
  plan: string,
  priceId: string
) {
  captureEvent(EVENTS.SUBSCRIPTION_ACTIVATED, {
    user_id: userId,
    plan,
    price_id: priceId,
  });
}

// Server-side event capture (for API routes)
export async function captureServerEvent(
  distinctId: string,
  eventName: string,
  properties?: Record<string, unknown>
) {
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://app.posthog.com";

  if (!key) return;

  try {
    await fetch(`${host}/capture/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        api_key: key,
        event: eventName,
        distinct_id: distinctId,
        properties: {
          ...properties,
          $lib: "posthog-node",
        },
      }),
    });
  } catch (error) {
    console.error("Failed to capture server event:", error);
  }
}
