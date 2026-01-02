import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { onboardingSchema } from "@/lib/validators/onboarding";
import { captureServerEvent, EVENTS } from "@/lib/analytics/events";

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

  const parsed = onboardingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const now = new Date().toISOString();

  const { error: updateError } = await supabase
    .from("profiles")
    .update({
      full_name: parsed.data.full_name,
      role: parsed.data.role,
      level: parsed.data.level || null,
      industry: parsed.data.industry || null,
      location_country: parsed.data.location_country || null,
      location_region: parsed.data.location_region || null,
      company_size: parsed.data.company_size || null,
      comp_band: parsed.data.comp_band || null,
      risk_tolerance: parsed.data.risk_tolerance || null,
      onboarding_completed_at: now,
      updated_at: now,
    })
    .eq("id", user.id);

  if (updateError) {
    console.error("Failed to update profile:", updateError);
    return NextResponse.json(
      { error: "Failed to save onboarding data" },
      { status: 500 }
    );
  }

  // Track analytics
  await captureServerEvent(user.id, EVENTS.ONBOARDING_COMPLETED, {
    role: parsed.data.role,
    level: parsed.data.level,
    industry: parsed.data.industry,
    company_size: parsed.data.company_size,
  });

  return NextResponse.json({
    ok: true,
    onboarding_completed_at: now,
  });
}
