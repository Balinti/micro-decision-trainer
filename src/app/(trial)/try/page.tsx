"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { TrialScenarioRunner } from "@/components/TrialScenarioRunner";
import { LoadingState } from "@/components/LoadingState";
import type { Scenario, ScenarioNode, OptionJson } from "@/types/db";

interface TrialNode {
  node_key: string;
  step_index: number;
  context: string;
  manager_line: string;
  is_terminal: boolean;
  options: {
    option_key: string;
    label: string;
    next_node_key: string | null;
  }[];
}

interface TrialData {
  scenario: Scenario;
  nodes: Record<string, TrialNode>;
  totalSteps: number;
}

export default function TryPage() {
  const router = useRouter();
  const [trialData, setTrialData] = useState<TrialData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAuthAndLoadTrial = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        // If user is already logged in, redirect to library
        if (user) {
          router.push("/library");
          return;
        }

        // Fetch trial scenario
        const response = await fetch("/api/trial/scenario");
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Failed to load trial");
        }
        const data = await response.json();
        setTrialData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load trial");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthAndLoadTrial();
  }, [router]);

  if (isLoading) {
    return <LoadingState message="Preparing your trial..." />;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Unable to load trial
        </h2>
        <p className="text-gray-600 mb-4">{error}</p>
        <a
          href="/signup"
          className="text-primary hover:underline"
        >
          Sign up to get started
        </a>
      </div>
    );
  }

  if (!trialData) {
    return null;
  }

  return (
    <TrialScenarioRunner
      scenario={trialData.scenario}
      nodes={trialData.nodes}
      totalSteps={trialData.totalSteps}
    />
  );
}
