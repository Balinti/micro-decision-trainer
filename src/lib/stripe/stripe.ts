import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
  typescript: true,
});

export const STRIPE_PRICES = {
  PRO_MONTHLY: process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID!,
  PRO_ANNUAL: process.env.NEXT_PUBLIC_STRIPE_PRO_ANNUAL_PRICE_ID!,
};
