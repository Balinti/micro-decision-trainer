import { NextRequest, NextResponse } from "next/server";

// Proxy endpoint for PostHog to avoid ad blockers
export async function POST(request: NextRequest) {
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://app.posthog.com";

  try {
    const body = await request.json();

    const response = await fetch(`${host}/capture/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("PostHog proxy error:", error);
    return NextResponse.json({ error: "Failed to proxy" }, { status: 500 });
  }
}
