"use client";

import { useState } from "react";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface PricingTableProps {
  isLoggedIn?: boolean;
  onCheckout?: (priceId: string) => void;
  isLoading?: boolean;
}

export function PricingTable({
  isLoggedIn = false,
  onCheckout,
  isLoading = false,
}: PricingTableProps) {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "annual">(
    "annual"
  );

  const plans = {
    free: {
      name: "Free",
      price: "$0",
      period: "forever",
      description: "Try PressurePlay with limited access",
      features: [
        { name: "1 scenario per week", included: true },
        { name: "Basic readiness score", included: true },
        { name: "Generic playbook template", included: true },
        { name: "All scenarios", included: false },
        { name: "Personalized playbooks", included: false },
        { name: "ROI estimates", included: false },
        { name: "Action tracking", included: false },
        { name: "Export & copy", included: false },
      ],
    },
    pro: {
      name: "Pro",
      monthlyPrice: "$11.99",
      annualPrice: "$6.67",
      annualTotal: "$79.99",
      description: "Full access to maximize your negotiation success",
      features: [
        { name: "All scenarios", included: true },
        { name: "Personalized readiness score", included: true },
        { name: "Personalized playbooks", included: true },
        { name: "ROI estimates", included: true },
        { name: "Action tracking", included: true },
        { name: "Export & copy", included: true },
        { name: "Priority support", included: true },
        { name: "New scenarios monthly", included: true },
      ],
    },
  };

  const handleFreePlan = () => {
    if (isLoggedIn) {
      window.location.href = "/dashboard";
    } else {
      window.location.href = "/signup";
    }
  };

  const monthlyPriceId = process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID;
  const annualPriceId = process.env.NEXT_PUBLIC_STRIPE_PRO_ANNUAL_PRICE_ID;
  const isPricingConfigured = Boolean(monthlyPriceId && annualPriceId);

  const handleProPlan = () => {
    if (!isPricingConfigured) return;

    if (!isLoggedIn) {
      window.location.href = "/signup?plan=pro";
      return;
    }

    const priceId = billingPeriod === "annual" ? annualPriceId : monthlyPriceId;

    if (onCheckout && priceId) {
      onCheckout(priceId);
    }
  };

  return (
    <div className="space-y-8">
      {/* Billing Toggle */}
      <div className="flex justify-center">
        <div className="inline-flex items-center bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setBillingPeriod("monthly")}
            className={cn(
              "px-4 py-2 rounded-md text-sm font-medium transition-colors",
              billingPeriod === "monthly"
                ? "bg-white shadow text-gray-900"
                : "text-gray-600 hover:text-gray-900"
            )}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingPeriod("annual")}
            className={cn(
              "px-4 py-2 rounded-md text-sm font-medium transition-colors",
              billingPeriod === "annual"
                ? "bg-white shadow text-gray-900"
                : "text-gray-600 hover:text-gray-900"
            )}
          >
            Annual
            <span className="ml-2 text-xs text-green-600 font-semibold">
              Save 44%
            </span>
          </button>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {/* Free Plan */}
        <Card>
          <CardHeader>
            <CardTitle>{plans.free.name}</CardTitle>
            <div className="mt-4">
              <span className="text-4xl font-bold">{plans.free.price}</span>
              <span className="text-gray-500 ml-2">{plans.free.period}</span>
            </div>
            <p className="text-gray-600 mt-2">{plans.free.description}</p>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              className="w-full mb-6"
              onClick={handleFreePlan}
            >
              {isLoggedIn ? "Current Plan" : "Get Started Free"}
            </Button>
            <ul className="space-y-3">
              {plans.free.features.map((feature, index) => (
                <li key={index} className="flex items-center gap-2">
                  {feature.included ? (
                    <Check className="h-5 w-5 text-green-600" />
                  ) : (
                    <X className="h-5 w-5 text-gray-300" />
                  )}
                  <span
                    className={
                      feature.included ? "text-gray-700" : "text-gray-400"
                    }
                  >
                    {feature.name}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Pro Plan */}
        <Card className="border-primary border-2 relative">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <span className="bg-primary text-white text-sm font-medium px-3 py-1 rounded-full">
              Most Popular
            </span>
          </div>
          <CardHeader>
            <CardTitle>{plans.pro.name}</CardTitle>
            <div className="mt-4">
              <span className="text-4xl font-bold">
                {billingPeriod === "annual"
                  ? plans.pro.annualPrice
                  : plans.pro.monthlyPrice}
              </span>
              <span className="text-gray-500 ml-2">/month</span>
              {billingPeriod === "annual" && (
                <p className="text-sm text-gray-500 mt-1">
                  Billed {plans.pro.annualTotal}/year
                </p>
              )}
            </div>
            <p className="text-gray-600 mt-2">{plans.pro.description}</p>
          </CardHeader>
          <CardContent>
            <Button
              className="w-full mb-6"
              onClick={handleProPlan}
              disabled={isLoading || !isPricingConfigured}
            >
              {isLoading ? "Loading..." : !isPricingConfigured ? "Coming Soon" : "Upgrade to Pro"}
            </Button>
            <ul className="space-y-3">
              {plans.pro.features.map((feature, index) => (
                <li key={index} className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-600" />
                  <span className="text-gray-700">{feature.name}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
