import Link from "next/link";
import { Lock, Crown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface PaywallGateProps {
  reason?: string;
  featureName?: string;
  children?: React.ReactNode;
}

export function PaywallGate({
  reason = "pro_required",
  featureName = "this feature",
  children,
}: PaywallGateProps) {
  return (
    <Card className="border-2 border-dashed border-gray-300 bg-gray-50">
      <CardContent className="py-8">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
            <Lock className="h-6 w-6 text-gray-400" />
          </div>

          <h3 className="text-lg font-semibold mb-2">
            Unlock {featureName} with Pro
          </h3>

          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Upgrade to Pro to access personalized playbooks, ROI estimates, and
            all scenarios.
          </p>

          <Link href={`/upgrade?reason=${reason}`}>
            <Button size="lg">
              <Crown className="h-4 w-4 mr-2" />
              Upgrade to Pro
            </Button>
          </Link>

          {children && <div className="mt-6">{children}</div>}
        </div>
      </CardContent>
    </Card>
  );
}
