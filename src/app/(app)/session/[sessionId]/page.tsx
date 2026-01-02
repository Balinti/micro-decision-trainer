import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ScenarioRunner } from "@/components/ScenarioRunner";

interface SessionPageProps {
  params: { sessionId: string };
}

export const metadata = {
  title: "Practice Session - PressurePlay",
};

export default async function SessionPage({ params }: SessionPageProps) {
  const supabase = createClient();
  const { sessionId } = params;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Check if sessionId is actually a scenarioId (start flow)
  const { data: scenario } = await supabase
    .from("scenarios")
    .select("id, title")
    .eq("id", sessionId)
    .single();

  if (scenario) {
    // This is a scenario ID, need to start a session
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/sessions`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenario_id: scenario.id }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      if (error.gating?.is_locked) {
        redirect("/upgrade?reason=pro_required");
      }
      throw new Error("Failed to start session");
    }

    const data = await response.json();
    redirect(`/session/${data.session.id}`);
  }

  // Fetch existing session
  const { data: session, error } = await supabase
    .from("scenario_sessions")
    .select(
      `
      *,
      scenarios (id, title, slug)
    `
    )
    .eq("id", sessionId)
    .eq("user_id", user.id)
    .single();

  if (error || !session) {
    notFound();
  }

  // If session is completed, redirect to playbook
  if (session.completed_at) {
    redirect(`/playbook/${session.id}`);
  }

  // Get current node
  const { data: currentNode } = await supabase
    .from("scenario_nodes")
    .select("*")
    .eq("scenario_id", session.scenario_id)
    .eq("node_key", session.current_node_key)
    .single();

  if (!currentNode) {
    throw new Error("Session state error");
  }

  const initialNode = {
    node_key: currentNode.node_key,
    step_index: currentNode.step_index,
    context: currentNode.context,
    manager_line: currentNode.manager_line,
    options: (currentNode.options_json as any[]).map((opt: any) => ({
      option_key: opt.option_key,
      label: opt.label,
    })),
    is_terminal: currentNode.is_terminal,
  };

  return (
    <ScenarioRunner
      sessionId={session.id}
      scenarioTitle={session.scenarios?.title || "Practice Session"}
      initialNode={initialNode}
      userId={user.id}
    />
  );
}
