import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const { data: entitlements } = await supabase
    .from("entitlements")
    .select("*")
    .eq("user_id", user.id)
    .single();

  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
    },
    profile: profile
      ? {
          full_name: profile.full_name,
          role: profile.role,
          level: profile.level,
          industry: profile.industry,
          location_country: profile.location_country,
          location_region: profile.location_region,
          company_size: profile.company_size,
          comp_band: profile.comp_band,
          risk_tolerance: profile.risk_tolerance,
          onboarding_completed_at: profile.onboarding_completed_at,
        }
      : null,
    entitlements: entitlements
      ? {
          plan: entitlements.plan,
          status: entitlements.status,
          current_period_end: entitlements.current_period_end,
        }
      : null,
  });
}
