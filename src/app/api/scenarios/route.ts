import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentWeekStart } from "@/lib/utils/time";

export async function GET() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Get user's plan
  let plan = "free";
  if (user) {
    const { data: entitlements } = await supabase
      .from("entitlements")
      .select("plan, status")
      .eq("user_id", user.id)
      .single();

    if (entitlements?.status === "active" && entitlements.plan === "pro") {
      plan = "pro";
    }
  }

  // Get published scenarios
  const { data: scenarios, error } = await supabase
    .from("scenarios")
    .select("id, title, description, difficulty, estimated_minutes, is_pro_only, weekly_featured_at")
    .eq("is_published", true)
    .eq("track", "raise_promo")
    .order("difficulty", { ascending: true });

  if (error) {
    console.error("Failed to fetch scenarios:", error);
    return NextResponse.json(
      { error: "Failed to fetch scenarios" },
      { status: 500 }
    );
  }

  // Determine the weekly free scenario
  const weekStart = getCurrentWeekStart();
  const weekStartStr = weekStart.toISOString().split("T")[0];

  // Find the scenario closest to current week's featured date, or pick the first one
  let weeklyFreeScenarioId: string | null = null;

  const featuredScenario = scenarios?.find(
    (s) => s.weekly_featured_at && s.weekly_featured_at >= weekStartStr
  );

  if (featuredScenario) {
    weeklyFreeScenarioId = featuredScenario.id;
  } else if (scenarios && scenarios.length > 0) {
    // Pick the first non-pro-only scenario, or first scenario
    const freeScenario = scenarios.find((s) => !s.is_pro_only);
    weeklyFreeScenarioId = freeScenario?.id || scenarios[0].id;
  }

  // Map scenarios with lock status
  const items = scenarios?.map((s) => {
    let isLocked = false;

    if (plan === "free") {
      // Free users can only access the weekly free scenario
      if (s.is_pro_only && s.id !== weeklyFreeScenarioId) {
        isLocked = true;
      } else if (!s.is_pro_only && s.id !== weeklyFreeScenarioId) {
        // Even non-pro scenarios are locked if not the weekly free one
        isLocked = true;
      }
    }

    return {
      id: s.id,
      title: s.title,
      description: s.description,
      difficulty: s.difficulty,
      estimated_minutes: s.estimated_minutes,
      is_locked: isLocked,
    };
  });

  return NextResponse.json({
    track: "raise_promo",
    weekly_free_scenario_id: weeklyFreeScenarioId,
    items: items || [],
  });
}
