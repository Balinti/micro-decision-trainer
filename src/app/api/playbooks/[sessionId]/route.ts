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

  // Get playbook
  const { data: playbook, error } = await supabase
    .from("playbooks")
    .select("*")
    .eq("session_id", sessionId)
    .eq("user_id", user.id)
    .single();

  if (error || !playbook) {
    return NextResponse.json({ error: "Playbook not found" }, { status: 404 });
  }

  // Get user plan to determine if personalized
  const { data: entitlements } = await supabase
    .from("entitlements")
    .select("plan, status")
    .eq("user_id", user.id)
    .single();

  const isPro =
    entitlements?.status === "active" && entitlements?.plan === "pro";

  const isPersonalized =
    isPro && Object.keys(playbook.personalization_json || {}).length > 0;

  return NextResponse.json({
    session_id: sessionId,
    content: playbook.content_json,
    is_personalized: isPersonalized,
  });
}
