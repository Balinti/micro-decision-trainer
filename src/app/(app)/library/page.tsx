import { createClient } from "@/lib/supabase/server";
import { ScenarioCard } from "@/components/ScenarioCard";

export const metadata = {
  title: "Scenarios - PressurePlay",
};

export default async function LibraryPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch scenarios via API to apply proper gating logic
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/scenarios`,
    {
      headers: {
        Cookie: "", // This won't work server-side, we'll fetch directly
      },
      cache: "no-store",
    }
  ).catch(() => null);

  // Fallback to direct DB query if fetch fails
  let scenarios: any[] = [];
  let weeklyFreeScenarioId: string | null = null;

  if (response?.ok) {
    const data = await response.json();
    scenarios = data.items || [];
    weeklyFreeScenarioId = data.weekly_free_scenario_id;
  } else {
    // Direct query as fallback
    const { data: entitlements } = await supabase
      .from("entitlements")
      .select("plan, status")
      .eq("user_id", user?.id)
      .single();

    const isPro =
      entitlements?.status === "active" && entitlements?.plan === "pro";

    const { data: dbScenarios } = await supabase
      .from("scenarios")
      .select("*")
      .eq("is_published", true)
      .order("difficulty", { ascending: true });

    // Find weekly free scenario
    const today = new Date().toISOString().split("T")[0];
    const featured = dbScenarios?.find(
      (s) => s.weekly_featured_at && s.weekly_featured_at >= today
    );
    weeklyFreeScenarioId = featured?.id || dbScenarios?.[0]?.id || null;

    scenarios =
      dbScenarios?.map((s) => ({
        id: s.id,
        title: s.title,
        description: s.description,
        difficulty: s.difficulty,
        estimated_minutes: s.estimated_minutes,
        is_locked: !isPro && s.id !== weeklyFreeScenarioId,
      })) || [];
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Scenario Library</h1>
        <p className="text-gray-600">
          Choose a scenario to practice. Each takes 3-5 minutes.
        </p>
      </div>

      {scenarios.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No scenarios available yet.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {scenarios.map((scenario) => (
            <ScenarioCard
              key={scenario.id}
              id={scenario.id}
              title={scenario.title}
              description={scenario.description}
              difficulty={scenario.difficulty}
              estimatedMinutes={scenario.estimated_minutes}
              isLocked={scenario.is_locked}
              isWeeklyFree={scenario.id === weeklyFreeScenarioId}
            />
          ))}
        </div>
      )}
    </div>
  );
}
