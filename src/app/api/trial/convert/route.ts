import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { captureServerEvent, EVENTS } from "@/lib/analytics/events";

interface PathEntry {
  node_key: string;
  option_key: string;
  answered_at: string;
}

interface ConvertRequest {
  scenarioId: string;
  currentNodeKey: string;
  pathJson: PathEntry[];
}

export async function POST(request: NextRequest) {
  const supabase = createClient();

  // This endpoint requires authentication
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: ConvertRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { scenarioId, currentNodeKey, pathJson } = body;

  if (!scenarioId || !currentNodeKey) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  // Validate scenario exists and get its version
  const { data: scenario, error: scenarioError } = await supabase
    .from("scenarios")
    .select("id, version, slug")
    .eq("id", scenarioId)
    .eq("is_published", true)
    .single();

  if (scenarioError || !scenario) {
    return NextResponse.json({ error: "Scenario not found" }, { status: 404 });
  }

  // Validate the node exists
  const { data: node, error: nodeError } = await supabase
    .from("scenario_nodes")
    .select("node_key")
    .eq("scenario_id", scenarioId)
    .eq("node_key", currentNodeKey)
    .single();

  if (nodeError || !node) {
    // Fallback to start if node not found
    body.currentNodeKey = "start";
  }

  // Create the session with the trial progress
  const { data: session, error: sessionError } = await supabase
    .from("scenario_sessions")
    .insert({
      user_id: user.id,
      scenario_id: scenarioId,
      scenario_version: scenario.version,
      current_node_key: body.currentNodeKey,
      path_json: pathJson || [],
    })
    .select()
    .single();

  if (sessionError) {
    console.error("Failed to create session from trial:", sessionError);
    return NextResponse.json(
      { error: "Failed to create session" },
      { status: 500 }
    );
  }

  // Track analytics
  await captureServerEvent(user.id, EVENTS.SCENARIO_STARTED, {
    scenario_id: scenarioId,
    scenario_slug: scenario.slug,
    session_id: session.id,
    from_trial: true,
  });

  return NextResponse.json({
    sessionId: session.id,
    redirectUrl: `/session/${session.id}`,
  });
}
