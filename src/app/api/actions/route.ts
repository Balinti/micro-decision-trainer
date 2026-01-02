import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createActionSchema } from "@/lib/validators/actions";

export async function GET() {
  const supabase = createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: actions, error } = await supabase
    .from("user_actions")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch actions:", error);
    return NextResponse.json(
      { error: "Failed to fetch actions" },
      { status: 500 }
    );
  }

  return NextResponse.json({ items: actions });
}

export async function POST(request: NextRequest) {
  const supabase = createClient();

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

  const parsed = createActionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { data: action, error } = await supabase
    .from("user_actions")
    .insert({
      user_id: user.id,
      type: parsed.data.type,
      title: parsed.data.title,
      due_date: parsed.data.due_date || null,
      notes: parsed.data.notes || null,
      status: "todo",
    })
    .select()
    .single();

  if (error) {
    console.error("Failed to create action:", error);
    return NextResponse.json(
      { error: "Failed to create action" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    id: action.id,
    status: action.status,
  });
}
