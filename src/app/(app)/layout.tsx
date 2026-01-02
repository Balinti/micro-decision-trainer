import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/AppShell";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: entitlements } = await supabase
    .from("entitlements")
    .select("plan, status")
    .eq("user_id", user.id)
    .single();

  const isPro =
    entitlements?.status === "active" && entitlements?.plan === "pro";

  return <AppShell isPro={isPro}>{children}</AppShell>;
}
