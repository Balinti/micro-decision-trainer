import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { updateActionSchema } from "@/lib/validators/actions";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { actionId: string } }
) {
  const supabase = createClient();
  const { actionId } = params;

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

  const parsed = updateActionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const updateData: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (parsed.data.status !== undefined) {
    updateData.status = parsed.data.status;
    if (parsed.data.status === "done") {
      updateData.completed_at = new Date().toISOString();
    }
  }

  if (parsed.data.title !== undefined) {
    updateData.title = parsed.data.title;
  }

  if (parsed.data.due_date !== undefined) {
    updateData.due_date = parsed.data.due_date;
  }

  if (parsed.data.notes !== undefined) {
    updateData.notes = parsed.data.notes;
  }

  const { error } = await supabase
    .from("user_actions")
    .update(updateData)
    .eq("id", actionId)
    .eq("user_id", user.id);

  if (error) {
    console.error("Failed to update action:", error);
    return NextResponse.json(
      { error: "Failed to update action" },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { actionId: string } }
) {
  const supabase = createClient();
  const { actionId } = params;

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { error } = await supabase
    .from("user_actions")
    .delete()
    .eq("id", actionId)
    .eq("user_id", user.id);

  if (error) {
    console.error("Failed to delete action:", error);
    return NextResponse.json(
      { error: "Failed to delete action" },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
