import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  const supabase = createClient();
  const { sessionId } = params;

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: session, error } = await supabase
    .from("scenario_sessions")
    .select(
      `
      *,
      scenarios (
        id,
        title,
        slug
      )
    `
    )
    .eq("id", sessionId)
    .eq("user_id", user.id)
    .single();

  if (error || !session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  // Get current node
  const { data: currentNode } = await supabase
    .from("scenario_nodes")
    .select("*")
    .eq("scenario_id", session.scenario_id)
    .eq("node_key", session.current_node_key)
    .single();

  if (!currentNode) {
    return NextResponse.json(
      { error: "Session state error" },
      { status: 500 }
    );
  }

  const options = (currentNode.options_json as any[]).map((opt: any) => ({
    option_key: opt.option_key,
    label: opt.label,
  }));

  return NextResponse.json({
    session: {
      id: session.id,
      scenario_id: session.scenario_id,
      current_node_key: session.current_node_key,
      readiness_score: session.readiness_score,
      completed_at: session.completed_at,
      path: session.path_json,
    },
    scenario: session.scenarios,
    node: {
      node_key: currentNode.node_key,
      step_index: currentNode.step_index,
      context: currentNode.context,
      manager_line: currentNode.manager_line,
      options,
      is_terminal: currentNode.is_terminal,
    },
  });
}
