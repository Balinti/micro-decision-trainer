"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LoadingState } from "@/components/LoadingState";

const TRIAL_STORAGE_KEY = "trial_progress";

interface TrialProgress {
  scenarioId: string;
  currentNodeKey: string;
  pathJson: {
    node_key: string;
    option_key: string;
    answered_at: string;
  }[];
  startedAt: string;
  remainingSeconds: number;
}

export default function TryConvertPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const convertTrial = async () => {
      // Check for trial progress in localStorage
      const saved = localStorage.getItem(TRIAL_STORAGE_KEY);

      if (!saved) {
        // No trial to convert, go to library
        router.push("/library");
        return;
      }

      let progress: TrialProgress;
      try {
        progress = JSON.parse(saved);
      } catch {
        localStorage.removeItem(TRIAL_STORAGE_KEY);
        router.push("/library");
        return;
      }

      // Convert the trial to a real session
      try {
        const response = await fetch("/api/trial/convert", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            scenarioId: progress.scenarioId,
            currentNodeKey: progress.currentNodeKey,
            pathJson: progress.pathJson,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to convert trial");
        }

        const data = await response.json();

        // Clear the trial progress
        localStorage.removeItem(TRIAL_STORAGE_KEY);

        // Redirect to the session
        router.push(data.redirectUrl);
      } catch (err) {
        console.error("Trial conversion error:", err);
        setError("Failed to restore your progress. Starting fresh.");
        localStorage.removeItem(TRIAL_STORAGE_KEY);
        setTimeout(() => router.push("/library"), 2000);
      }
    };

    convertTrial();
  }, [router]);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <LoadingState message="Restoring your progress..." />
    </div>
  );
}
