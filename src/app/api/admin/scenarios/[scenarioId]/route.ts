import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { adminScenarioPayloadSchema, validateScenarioGraph } from "@/lib/validators/scenario";

export async function GET(
  request: NextRequest,
  { params }: { params: { scenarioId: string } }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { scenarioId } = params;
  const supabase = createServiceClient();

  const { data: scenario, error: scenarioError } = await supabase
    .from("scenarios")
    .select("*")
    .eq("id", scenarioId)
    .single();

  if (scenarioError || !scenario) {
    return NextResponse.json({ error: "Scenario not found" }, { status: 404 });
  }

  const { data: nodes, error: nodesError } = await supabase
    .from("scenario_nodes")
    .select("*")
    .eq("scenario_id", scenarioId)
    .order("step_index", { ascending: true });

  if (nodesError) {
    console.error("Failed to fetch nodes:", nodesError);
    return NextResponse.json(
      { error: "Failed to fetch scenario" },
      { status: 500 }
    );
  }

  return NextResponse.json({ scenario, nodes });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { scenarioId: string } }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { scenarioId } = params;

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = adminScenarioPayloadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  // Validate graph structure
  const graphValidation = validateScenarioGraph(parsed.data.nodes);
  if (!graphValidation.valid) {
    return NextResponse.json(
      { error: "Invalid scenario graph", details: graphValidation.errors },
      { status: 400 }
    );
  }

  const supabase = createServiceClient();

  // Get current version
  const { data: currentScenario } = await supabase
    .from("scenarios")
    .select("version")
    .eq("id", scenarioId)
    .single();

  if (!currentScenario) {
    return NextResponse.json({ error: "Scenario not found" }, { status: 404 });
  }

  // Update scenario with incremented version
  const { error: updateError } = await supabase
    .from("scenarios")
    .update({
      ...parsed.data.scenario,
      version: currentScenario.version + 1,
      updated_at: new Date().toISOString(),
    })
    .eq("id", scenarioId);

  if (updateError) {
    console.error("Failed to update scenario:", updateError);
    return NextResponse.json(
      { error: "Failed to update scenario" },
      { status: 500 }
    );
  }

  // Delete existing nodes
  await supabase.from("scenario_nodes").delete().eq("scenario_id", scenarioId);

  // Create new nodes
  const nodes = parsed.data.nodes.map((node) => ({
    scenario_id: scenarioId,
    node_key: node.node_key,
    step_index: node.step_index,
    context: node.context,
    manager_line: node.manager_line,
    options_json: node.options_json,
    scoring_json: node.scoring_json,
    is_terminal: node.is_terminal,
  }));

  const { error: nodesError } = await supabase
    .from("scenario_nodes")
    .insert(nodes);

  if (nodesError) {
    console.error("Failed to update nodes:", nodesError);
    return NextResponse.json(
      { error: "Failed to update scenario nodes" },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { scenarioId: string } }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { scenarioId } = params;
  const supabase = createServiceClient();

  // Delete scenario (cascade will delete nodes)
  const { error: deleteError } = await supabase
    .from("scenarios")
    .delete()
    .eq("id", scenarioId);

  if (deleteError) {
    console.error("Failed to delete scenario:", deleteError);
    return NextResponse.json(
      { error: "Failed to delete scenario" },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
