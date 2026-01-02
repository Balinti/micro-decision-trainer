import { stripe } from "./stripe";
import { createServiceClient } from "@/lib/supabase/server";
import type Stripe from "stripe";

export async function createOrRetrieveCustomer(
  userId: string,
  email: string
): Promise<string> {
  const supabase = createServiceClient();

  // Check if customer already exists
  const { data: entitlement } = await supabase
    .from("entitlements")
    .select("stripe_customer_id")
    .eq("user_id", userId)
    .single();

  if (entitlement?.stripe_customer_id) {
    return entitlement.stripe_customer_id;
  }

  // Create new customer
  const customer = await stripe.customers.create({
    email,
    metadata: {
      supabase_user_id: userId,
    },
  });

  // Update entitlements with customer ID
  await supabase
    .from("entitlements")
    .update({ stripe_customer_id: customer.id })
    .eq("user_id", userId);

  return customer.id;
}

export async function handleSubscriptionChange(
  subscription: Stripe.Subscription,
  customerId: string
) {
  const supabase = createServiceClient();

  // Find user by customer ID
  const { data: entitlement } = await supabase
    .from("entitlements")
    .select("user_id")
    .eq("stripe_customer_id", customerId)
    .single();

  if (!entitlement) {
    console.error("No user found for customer:", customerId);
    return;
  }

  const status = subscription.status;
  const plan = subscription.items.data[0]?.price.id ? "pro" : "free";

  let mappedStatus: "active" | "past_due" | "canceled" | "trialing";
  switch (status) {
    case "active":
      mappedStatus = "active";
      break;
    case "past_due":
      mappedStatus = "past_due";
      break;
    case "canceled":
    case "unpaid":
      mappedStatus = "canceled";
      break;
    case "trialing":
      mappedStatus = "trialing";
      break;
    default:
      mappedStatus = "active";
  }

  await supabase
    .from("entitlements")
    .update({
      plan: status === "canceled" || status === "unpaid" ? "free" : plan,
      status: mappedStatus,
      stripe_subscription_id: subscription.id,
      current_period_end: new Date(
        subscription.current_period_end * 1000
      ).toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", entitlement.user_id);
}

export async function handleSubscriptionDeleted(customerId: string) {
  const supabase = createServiceClient();

  const { data: entitlement } = await supabase
    .from("entitlements")
    .select("user_id")
    .eq("stripe_customer_id", customerId)
    .single();

  if (!entitlement) {
    console.error("No user found for customer:", customerId);
    return;
  }

  await supabase
    .from("entitlements")
    .update({
      plan: "free",
      status: "canceled",
      stripe_subscription_id: null,
      current_period_end: null,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", entitlement.user_id);
}
