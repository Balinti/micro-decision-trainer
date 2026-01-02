import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { adminScenarioPayloadSchema, validateScenarioGraph } from "@/lib/validators/scenario";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const supabase = createClient();

  const { data: scenarios, error: fetchError } = await supabase
    .from("scenarios")
    .select("*")
    .order("created_at", { ascending: false });

  if (fetchError) {
    console.error("Failed to fetch scenarios:", fetchError);
    return NextResponse.json(
      { error: "Failed to fetch scenarios" },
      { status: 500 }
    );
  }

  return NextResponse.json({ scenarios });
}

export async function POST(request: NextRequest) {
  const { user, error } = await requireAdmin();
  if (error) return error;

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

  // Use service client for admin operations
  const supabase = createServiceClient();

  // Create scenario
  const { data: scenario, error: scenarioError } = await supabase
    .from("scenarios")
    .insert({
      ...parsed.data.scenario,
      track: "raise_promo",
      created_by: user!.id,
    })
    .select()
    .single();

  if (scenarioError) {
    console.error("Failed to create scenario:", scenarioError);
    return NextResponse.json(
      { error: "Failed to create scenario" },
      { status: 500 }
    );
  }

  // Create nodes
  const nodes = parsed.data.nodes.map((node) => ({
    scenario_id: scenario.id,
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
    console.error("Failed to create nodes:", nodesError);
    // Rollback scenario
    await supabase.from("scenarios").delete().eq("id", scenario.id);
    return NextResponse.json(
      { error: "Failed to create scenario nodes" },
      { status: 500 }
    );
  }

  return NextResponse.json({ scenario });
}
