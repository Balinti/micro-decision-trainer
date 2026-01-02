import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { AdminScenarioEditor } from "@/components/AdminScenarioEditor";

interface EditScenarioPageProps {
  params: { scenarioId: string };
}

export async function generateMetadata({ params }: EditScenarioPageProps) {
  const isNew = params.scenarioId === "new";
  return {
    title: isNew ? "New Scenario - Admin" : "Edit Scenario - Admin",
  };
}

export default async function EditScenarioPage({ params }: EditScenarioPageProps) {
  const { scenarioId } = params;
  const isNew = scenarioId === "new";

  let scenario = null;
  let nodes = null;

  if (!isNew) {
    const supabase = createClient();

    const { data: scenarioData, error: scenarioError } = await supabase
      .from("scenarios")
      .select("*")
      .eq("id", scenarioId)
      .single();

    if (scenarioError || !scenarioData) {
      notFound();
    }

    const { data: nodesData } = await supabase
      .from("scenario_nodes")
      .select("*")
      .eq("scenario_id", scenarioId)
      .order("step_index", { ascending: true });

    scenario = {
      slug: scenarioData.slug,
      title: scenarioData.title,
      description: scenarioData.description,
      difficulty: scenarioData.difficulty,
      estimated_minutes: scenarioData.estimated_minutes,
      is_published: scenarioData.is_published,
      is_pro_only: scenarioData.is_pro_only,
    };

    nodes = nodesData?.map((n) => ({
      node_key: n.node_key,
      step_index: n.step_index,
      context: n.context,
      manager_line: n.manager_line,
      options_json: n.options_json,
      scoring_json: n.scoring_json,
      is_terminal: n.is_terminal,
    }));
  }

  return (
    <div>
      <Link
        href="/admin/scenarios"
        className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Scenarios
      </Link>

      <h1 className="text-2xl font-bold mb-8">
        {isNew ? "Create New Scenario" : "Edit Scenario"}
      </h1>

      <AdminScenarioEditor
        scenario={scenario || undefined}
        nodes={nodes || undefined}
        scenarioId={isNew ? undefined : scenarioId}
        isNew={isNew}
      />
    </div>
  );
}
