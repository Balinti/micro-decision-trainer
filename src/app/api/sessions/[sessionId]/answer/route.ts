import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { answerSchema } from "@/lib/validators/session";
import { captureServerEvent, EVENTS } from "@/lib/analytics/events";

export async function POST(
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

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = answerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { option_key } = parsed.data;

  // Get session
  const { data: session, error: sessionError } = await supabase
    .from("scenario_sessions")
    .select("*")
    .eq("id", sessionId)
    .eq("user_id", user.id)
    .single();

  if (sessionError || !session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  if (session.completed_at) {
    return NextResponse.json(
      { error: "Session already completed" },
      { status: 400 }
    );
  }

  // Get current node
  const { data: currentNode, error: nodeError } = await supabase
    .from("scenario_nodes")
    .select("*")
    .eq("scenario_id", session.scenario_id)
    .eq("node_key", session.current_node_key)
    .single();

  if (nodeError || !currentNode) {
    return NextResponse.json(
      { error: "Session state error" },
      { status: 500 }
    );
  }

  // Find the selected option
  const options = currentNode.options_json as any[];
  const selectedOption = options.find((opt) => opt.option_key === option_key);

  if (!selectedOption) {
    return NextResponse.json({ error: "Invalid option" }, { status: 400 });
  }

  // Update path
  const path = [...(session.path_json as any[])];
  path.push({
    node_key: session.current_node_key,
    option_key: option_key,
    answered_at: new Date().toISOString(),
  });

  const nextNodeKey = selectedOption.next_node_key;

  // Track analytics
  await captureServerEvent(user.id, EVENTS.OPTION_SELECTED, {
    session_id: sessionId,
    node_key: session.current_node_key,
    option_key: option_key,
    step_index: currentNode.step_index,
  });

  // If terminal node or no next node, stay on current (complete will handle it)
  if (!nextNodeKey || currentNode.is_terminal) {
    await supabase
      .from("scenario_sessions")
      .update({
        path_json: path,
        updated_at: new Date().toISOString(),
      })
      .eq("id", sessionId);

    return NextResponse.json({
      session: {
        id: session.id,
        current_node_key: session.current_node_key,
      },
      node: {
        node_key: currentNode.node_key,
        step_index: currentNode.step_index,
        context: currentNode.context,
        manager_line: currentNode.manager_line,
        options: [],
        is_terminal: true,
      },
    });
  }

  // Get next node
  const { data: nextNode, error: nextNodeError } = await supabase
    .from("scenario_nodes")
    .select("*")
    .eq("scenario_id", session.scenario_id)
    .eq("node_key", nextNodeKey)
    .single();

  if (nextNodeError || !nextNode) {
    console.error("Next node not found:", nextNodeKey);
    return NextResponse.json(
      { error: "Scenario configuration error" },
      { status: 500 }
    );
  }

  // Update session
  await supabase
    .from("scenario_sessions")
    .update({
      current_node_key: nextNodeKey,
      path_json: path,
      updated_at: new Date().toISOString(),
    })
    .eq("id", sessionId);

  // Format options for display
  const nextOptions = (nextNode.options_json as any[]).map((opt: any) => ({
    option_key: opt.option_key,
    label: opt.label,
  }));

  return NextResponse.json({
    session: {
      id: session.id,
      current_node_key: nextNodeKey,
    },
    node: {
      node_key: nextNode.node_key,
      step_index: nextNode.step_index,
      context: nextNode.context,
      manager_line: nextNode.manager_line,
      options: nextOptions,
      is_terminal: nextNode.is_terminal,
    },
  });
}
