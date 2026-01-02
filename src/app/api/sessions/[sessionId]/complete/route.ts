import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { calculateReadinessScore } from "@/lib/scoring/readiness";
import { calculateROI } from "@/lib/scoring/roiModel";
import { generatePlaybook, generateGenericPlaybook } from "@/lib/personalization/render";
import { captureServerEvent, EVENTS } from "@/lib/analytics/events";
import type { PathEntry, ScoringJson } from "@/types/scenario";
import type { Profile } from "@/types/db";

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

  // Get all nodes for this scenario to calculate scoring
  const { data: nodes, error: nodesError } = await supabase
    .from("scenario_nodes")
    .select("node_key, scoring_json")
    .eq("scenario_id", session.scenario_id);

  if (nodesError || !nodes) {
    return NextResponse.json(
      { error: "Failed to fetch scenario data" },
      { status: 500 }
    );
  }

  // Build scoring map
  const nodeScorings = new Map<string, ScoringJson>();
  for (const node of nodes) {
    nodeScorings.set(node.node_key, node.scoring_json as ScoringJson);
  }

  // Get user profile and entitlements
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const { data: entitlements } = await supabase
    .from("entitlements")
    .select("plan, status")
    .eq("user_id", user.id)
    .single();

  const isPro =
    entitlements?.status === "active" && entitlements?.plan === "pro";

  // Calculate readiness score
  const path = session.path_json as PathEntry[];
  const readinessResult = calculateReadinessScore(path, nodeScorings);

  // Calculate ROI (only for Pro users)
  let roiData = null;
  if (isPro) {
    roiData = calculateROI(
      path,
      nodeScorings,
      profile as Profile | null,
      readinessResult.score
    );
  }

  // Generate playbook
  let playbookContent;
  if (isPro) {
    playbookContent = generatePlaybook(
      profile as Profile | null,
      readinessResult.score,
      readinessResult.risks,
      true
    );
  } else {
    playbookContent = generateGenericPlaybook();
  }

  // Save playbook
  const { error: playbookError } = await supabase.from("playbooks").insert({
    user_id: user.id,
    session_id: sessionId,
    content_json: playbookContent,
    personalization_json: isPro ? { profile_id: user.id } : {},
  });

  if (playbookError) {
    console.error("Failed to save playbook:", playbookError);
  }

  // Update session as completed
  const now = new Date().toISOString();
  await supabase
    .from("scenario_sessions")
    .update({
      completed_at: now,
      readiness_score: readinessResult.score,
      roi_json: roiData,
      updated_at: now,
    })
    .eq("id", sessionId);

  // Track analytics
  await captureServerEvent(user.id, EVENTS.SCENARIO_COMPLETED, {
    session_id: sessionId,
    scenario_id: session.scenario_id,
    readiness_score: readinessResult.score,
    path_length: path.length,
  });

  // Return response based on plan
  if (isPro) {
    return NextResponse.json({
      completed: true,
      readiness_score: readinessResult.score,
      roi: roiData,
      top_risks: readinessResult.risks.map((r) => ({
        risk_key: r.riskKey,
        label: r.label,
        typical_downside: r.typicalDownside,
        better_default: r.betterDefault,
      })),
      playbook_url: `/playbook/${sessionId}`,
    });
  } else {
    return NextResponse.json({
      completed: true,
      readiness_score: readinessResult.score,
      paywall: {
        locked_features: ["personalized_playbook", "roi_model", "export_copy"],
        upgrade_url: "/upgrade?reason=unlock_playbook",
      },
      playbook_url: `/playbook/${sessionId}`,
    });
  }
}
