"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { LoadingState } from "@/components/LoadingState";

export default function CallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/dashboard";

  useEffect(() => {
    const handleCallback = async () => {
      const supabase = createClient();

      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error("Auth callback error:", error);
        router.push("/login?error=callback_failed");
        return;
      }

      if (data.session) {
        // Check if user has completed onboarding
        const { data: profile } = await supabase
          .from("profiles")
          .select("onboarding_completed_at")
          .eq("id", data.session.user.id)
          .single();

        if (!profile?.onboarding_completed_at) {
          router.push("/onboarding");
        } else {
          router.push(redirect);
        }
      } else {
        router.push("/login");
      }
    };

    handleCallback();
  }, [router, redirect]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <LoadingState message="Completing sign in..." />
    </div>
  );
}
