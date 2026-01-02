"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User, CreditCard, Settings } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingState } from "@/components/LoadingState";
import { toast } from "@/components/ui/use-toast";

interface UserData {
  user: { id: string; email: string };
  profile: {
    full_name: string | null;
    role: string | null;
    level: string | null;
  } | null;
  entitlements: {
    plan: string;
    status: string;
    current_period_end: string | null;
  } | null;
}

export default function AccountPage() {
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPortalLoading, setIsPortalLoading] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const response = await fetch("/api/me");
      if (response.ok) {
        const data = await response.json();
        setUserData(data);
      }
    } catch (error) {
      console.error("Failed to load user data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleManageBilling = async () => {
    setIsPortalLoading(true);

    try {
      const response = await fetch("/api/stripe/portal", {
        method: "POST",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to open billing portal");
      }

      const data = await response.json();
      window.location.href = data.url;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      setIsPortalLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingState message="Loading account..." />;
  }

  if (!userData) {
    return <div>Failed to load account data.</div>;
  }

  const isPro =
    userData.entitlements?.plan === "pro" &&
    userData.entitlements?.status === "active";

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Account Settings</h1>
        <p className="text-gray-600">Manage your account and subscription.</p>
      </div>

      <div className="space-y-6">
        {/* Profile Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-medium">{userData.user.email}</p>
            </div>
            {userData.profile?.full_name && (
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-medium">{userData.profile.full_name}</p>
              </div>
            )}
            {userData.profile?.role && (
              <div>
                <p className="text-sm text-gray-500">Role</p>
                <p className="font-medium">
                  {userData.profile.role}
                  {userData.profile.level && ` (${userData.profile.level})`}
                </p>
              </div>
            )}
            <Button variant="outline" onClick={() => router.push("/onboarding")}>
              Edit Profile
            </Button>
          </CardContent>
        </Card>

        {/* Subscription Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Subscription
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <p className="text-sm text-gray-500">Plan:</p>
              <Badge variant={isPro ? "default" : "secondary"}>
                {isPro ? "Pro" : "Free"}
              </Badge>
            </div>

            {userData.entitlements?.current_period_end && isPro && (
              <div>
                <p className="text-sm text-gray-500">Renews on</p>
                <p className="font-medium">
                  {new Date(
                    userData.entitlements.current_period_end
                  ).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
            )}

            {isPro ? (
              <Button
                variant="outline"
                onClick={handleManageBilling}
                disabled={isPortalLoading}
              >
                {isPortalLoading ? "Loading..." : "Manage Billing"}
              </Button>
            ) : (
              <Button onClick={() => router.push("/upgrade")}>
                Upgrade to Pro
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <Settings className="h-5 w-5" />
              Account Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Need to delete your account? Contact us at support@pressureplay.app.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
