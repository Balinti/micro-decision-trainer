"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Crown, Check } from "lucide-react";
import { PricingTable } from "@/components/PricingTable";
import { toast } from "@/components/ui/use-toast";

export default function UpgradePage() {
  const searchParams = useSearchParams();
  const reason = searchParams.get("reason");
  const checkoutStatus = searchParams.get("checkout");

  const [isLoading, setIsLoading] = useState(false);

  // Show success message if coming from checkout
  if (checkoutStatus === "success") {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
          <Check className="h-8 w-8 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Welcome to Pro!</h1>
        <p className="text-gray-600 mb-6">
          Your subscription is now active. Enjoy full access to all scenarios
          and personalized playbooks.
        </p>
        <a
          href="/library"
          className="inline-flex items-center justify-center rounded-md bg-primary px-8 py-3 text-white font-medium hover:bg-primary/90"
        >
          Explore All Scenarios
        </a>
      </div>
    );
  }

  const handleCheckout = async (priceId: string) => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          price_id: priceId,
          success_url: `${window.location.origin}/upgrade?checkout=success`,
          cancel_url: `${window.location.origin}/upgrade?checkout=canceled`,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to start checkout");
      }

      const data = await response.json();
      window.location.href = data.url;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const reasonMessages: Record<string, string> = {
    pro_required: "This scenario requires a Pro subscription.",
    unlock_playbook: "Get personalized playbooks with Pro.",
    unlock_roi: "See ROI estimates with Pro.",
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white mb-4">
          <Crown className="h-8 w-8" />
        </div>
        <h1 className="text-3xl font-bold mb-2">Upgrade to Pro</h1>
        {reason && reasonMessages[reason] ? (
          <p className="text-gray-600">{reasonMessages[reason]}</p>
        ) : (
          <p className="text-gray-600">
            Unlock all scenarios, personalized playbooks, and more.
          </p>
        )}
      </div>

      <PricingTable isLoggedIn={true} onCheckout={handleCheckout} isLoading={isLoading} />
    </div>
  );
}
