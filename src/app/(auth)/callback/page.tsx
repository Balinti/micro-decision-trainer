"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { LoadingState } from "@/components/LoadingState";

function CallbackContent() {
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
        // If redirecting to try-convert, skip onboarding check
        // (trial conversion will handle sending them to the right place)
        if (redirect === "/try-convert") {
          router.push(redirect);
          return;
        }

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

export default function CallbackPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><LoadingState message="Loading..." /></div>}>
      <CallbackContent />
    </Suspense>
  );
}
