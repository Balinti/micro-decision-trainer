"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LoadingState } from "@/components/LoadingState";

interface StartSessionPageProps {
  params: { sessionId: string };
}

export default function StartSessionPage({ params }: StartSessionPageProps) {
  const router = useRouter();
  const scenarioId = params.sessionId;

  useEffect(() => {
    const startSession = async () => {
      try {
        const response = await fetch("/api/sessions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ scenario_id: scenarioId }),
        });

        if (!response.ok) {
          const error = await response.json();
          if (error.gating?.is_locked) {
            router.push("/upgrade?reason=pro_required");
            return;
          }
          throw new Error(error.error || "Failed to start session");
        }

        const data = await response.json();
        router.replace(`/session/${data.session.id}`);
      } catch (error) {
        console.error("Failed to start session:", error);
        router.push("/library");
      }
    };

    startSession();
  }, [scenarioId, router]);

  return (
    <div className="max-w-2xl mx-auto">
      <LoadingState message="Starting your practice session..." />
    </div>
  );
}
