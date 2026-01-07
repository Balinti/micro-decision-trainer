import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { stripe, STRIPE_PRICES } from "@/lib/stripe/stripe";
import { createOrRetrieveCustomer } from "@/lib/stripe/helpers";
import { captureServerEvent, EVENTS } from "@/lib/analytics/events";
import { getAppUrl } from "@/lib/utils/env";

export async function POST(request: NextRequest) {
  const supabase = createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { price_id, success_url, cancel_url } = body;

  if (!price_id) {
    return NextResponse.json({ error: "price_id is required" }, { status: 400 });
  }

  // Validate price_id
  const validPriceIds = [STRIPE_PRICES.PRO_MONTHLY, STRIPE_PRICES.PRO_ANNUAL];
  if (!validPriceIds.includes(price_id)) {
    return NextResponse.json({ error: "Invalid price_id" }, { status: 400 });
  }

  try {
    // Create or retrieve Stripe customer
    const customerId = await createOrRetrieveCustomer(user.id, user.email!);

    // Create checkout session
    const appUrl = getAppUrl();
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: price_id,
          quantity: 1,
        },
      ],
      success_url: success_url || `${appUrl}/dashboard?checkout=success`,
      cancel_url: cancel_url || `${appUrl}/upgrade?checkout=canceled`,
      subscription_data: {
        metadata: {
          supabase_user_id: user.id,
          app_name: "micro-decision-trainer",
        },
      },
      metadata: {
        supabase_user_id: user.id,
        app_name: "micro-decision-trainer",
      },
    });

    // Track analytics
    const plan = price_id === STRIPE_PRICES.PRO_ANNUAL ? "annual" : "monthly";
    await captureServerEvent(user.id, EVENTS.CHECKOUT_STARTED, {
      price_id,
      plan,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
