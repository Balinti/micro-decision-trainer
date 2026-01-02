import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { startSessionSchema } from "@/lib/validators/session";
import { getCurrentWeekStart } from "@/lib/utils/time";
import { captureServerEvent, EVENTS } from "@/lib/analytics/events";

export async function POST(request: NextRequest) {
  const supabase = createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = startSessionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { scenario_id } = parsed.data;

  // Get scenario and validate access
  const { data: scenario, error: scenarioError } = await supabase
    .from("scenarios")
    .select("id, slug, title, version, is_published, is_pro_only, weekly_featured_at")
    .eq("id", scenario_id)
    .single();

  if (scenarioError || !scenario) {
    return NextResponse.json({ error: "Scenario not found" }, { status: 404 });
  }

  if (!scenario.is_published) {
    return NextResponse.json({ error: "Scenario not published" }, { status: 404 });
  }

  // Check user plan and gating
  const { data: entitlements } = await supabase
    .from("entitlements")
    .select("plan, status")
    .eq("user_id", user.id)
    .single();

  const isPro =
    entitlements?.status === "active" && entitlements?.plan === "pro";

  if (!isPro && scenario.is_pro_only) {
    // Check if this is the weekly free scenario
    const weekStart = getCurrentWeekStart();
    const weekStartStr = weekStart.toISOString().split("T")[0];

    const isWeeklyFree =
      scenario.weekly_featured_at && scenario.weekly_featured_at >= weekStartStr;

    // Also check if it's the first published scenario (fallback weekly)
    const { data: firstScenario } = await supabase
      .from("scenarios")
      .select("id")
      .eq("is_published", true)
      .order("created_at", { ascending: true })
      .limit(1)
      .single();

    const isFallbackWeekly = firstScenario?.id === scenario_id;

    if (!isWeeklyFree && !isFallbackWeekly) {
      return NextResponse.json({
        gating: { is_locked: true, reason: "pro_required" },
        upgrade_url: "/upgrade?reason=pro_required",
      });
    }
  }

  // Get the start node
  const { data: startNode, error: nodeError } = await supabase
    .from("scenario_nodes")
    .select("*")
    .eq("scenario_id", scenario_id)
    .eq("node_key", "start")
    .single();

  if (nodeError || !startNode) {
    console.error("Start node not found:", nodeError);
    return NextResponse.json(
      { error: "Scenario configuration error" },
      { status: 500 }
    );
  }

  // Create session
  const { data: session, error: sessionError } = await supabase
    .from("scenario_sessions")
    .insert({
      user_id: user.id,
      scenario_id: scenario_id,
      scenario_version: scenario.version,
      current_node_key: "start",
      path_json: [],
    })
    .select()
    .single();

  if (sessionError) {
    console.error("Failed to create session:", sessionError);
    return NextResponse.json(
      { error: "Failed to create session" },
      { status: 500 }
    );
  }

  // Track analytics
  await captureServerEvent(user.id, EVENTS.SCENARIO_STARTED, {
    scenario_id: scenario_id,
    scenario_slug: scenario.slug,
    session_id: session.id,
  });

  // Format options for display (hide user_line and scoring data)
  const options = (startNode.options_json as any[]).map((opt: any) => ({
    option_key: opt.option_key,
    label: opt.label,
  }));

  return NextResponse.json({
    session: {
      id: session.id,
      scenario_id: session.scenario_id,
      current_node_key: session.current_node_key,
      readiness_score: null,
    },
    node: {
      node_key: startNode.node_key,
      step_index: startNode.step_index,
      context: startNode.context,
      manager_line: startNode.manager_line,
      options,
    },
    gating: { is_locked: false, reason: null },
  });
}

export async function GET() {
  const supabase = createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: sessions, error } = await supabase
    .from("scenario_sessions")
    .select(
      `
      id,
      scenario_id,
      started_at,
      completed_at,
      readiness_score,
      scenarios (
        title,
        slug
      )
    `
    )
    .eq("user_id", user.id)
    .order("started_at", { ascending: false })
    .limit(20);

  if (error) {
    console.error("Failed to fetch sessions:", error);
    return NextResponse.json(
      { error: "Failed to fetch sessions" },
      { status: 500 }
    );
  }

  return NextResponse.json({ sessions });
}
