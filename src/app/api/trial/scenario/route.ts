import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentWeekStart } from "@/lib/utils/time";
import type { ScenarioNode, OptionJson } from "@/types/db";

export async function GET() {
  const supabase = createClient();

  // Get the weekly free scenario
  const weekStart = getCurrentWeekStart();
  const weekStartStr = weekStart.toISOString().split("T")[0];

  // First try to get the weekly featured scenario
  let { data: scenario, error: scenarioError } = await supabase
    .from("scenarios")
    .select("*")
    .eq("is_published", true)
    .gte("weekly_featured_at", weekStartStr)
    .order("weekly_featured_at", { ascending: false })
    .limit(1)
    .single();

  // If no weekly featured, fall back to first published scenario
  if (scenarioError || !scenario) {
    const { data: fallbackScenario, error: fallbackError } = await supabase
      .from("scenarios")
      .select("*")
      .eq("is_published", true)
      .order("created_at", { ascending: true })
      .limit(1)
      .single();

    if (fallbackError || !fallbackScenario) {
      return NextResponse.json(
        { error: "No scenarios available" },
        { status: 404 }
      );
    }

    scenario = fallbackScenario;
  }

  // Get all nodes for the scenario (for client-side navigation)
  const { data: nodes, error: nodesError } = await supabase
    .from("scenario_nodes")
    .select("*")
    .eq("scenario_id", scenario.id)
    .order("step_index", { ascending: true });

  if (nodesError || !nodes || nodes.length === 0) {
    console.error("Failed to fetch scenario nodes:", nodesError);
    return NextResponse.json(
      { error: "Scenario configuration error" },
      { status: 500 }
    );
  }

  // Build node map for client-side navigation
  // Strip out scoring data and user_line (keep only what's needed for display)
  const nodeMap: Record<
    string,
    {
      node_key: string;
      step_index: number;
      context: string;
      manager_line: string;
      is_terminal: boolean;
      options: { option_key: string; label: string; next_node_key: string | null }[];
    }
  > = {};

  let maxStepIndex = 0;

  for (const node of nodes as ScenarioNode[]) {
    const options = (node.options_json as OptionJson[]).map((opt) => ({
      option_key: opt.option_key,
      label: opt.label,
      next_node_key: opt.next_node_key,
    }));

    nodeMap[node.node_key] = {
      node_key: node.node_key,
      step_index: node.step_index,
      context: node.context,
      manager_line: node.manager_line,
      is_terminal: node.is_terminal,
      options,
    };

    if (node.step_index > maxStepIndex) {
      maxStepIndex = node.step_index;
    }
  }

  return NextResponse.json({
    scenario: {
      id: scenario.id,
      title: scenario.title,
      description: scenario.description,
      difficulty: scenario.difficulty,
      estimated_minutes: scenario.estimated_minutes,
    },
    nodes: nodeMap,
    totalSteps: maxStepIndex,
  });
}
