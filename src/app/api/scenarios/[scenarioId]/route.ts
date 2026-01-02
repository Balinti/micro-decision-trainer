import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { scenarioId: string } }
) {
  const supabase = createClient();
  const { scenarioId } = params;

  const { data: scenario, error } = await supabase
    .from("scenarios")
    .select(
      "id, title, description, difficulty, estimated_minutes, is_pro_only, is_published"
    )
    .eq("id", scenarioId)
    .eq("is_published", true)
    .single();

  if (error || !scenario) {
    return NextResponse.json({ error: "Scenario not found" }, { status: 404 });
  }

  return NextResponse.json({
    id: scenario.id,
    title: scenario.title,
    description: scenario.description,
    difficulty: scenario.difficulty,
    estimated_minutes: scenario.estimated_minutes,
    is_pro_only: scenario.is_pro_only,
    is_published: scenario.is_published,
  });
}
