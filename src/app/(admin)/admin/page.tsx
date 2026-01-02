import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Users, TrendingUp } from "lucide-react";

export const metadata = {
  title: "Admin Dashboard - PressurePlay",
};

export default async function AdminDashboardPage() {
  const supabase = createClient();

  // Get stats
  const { count: scenarioCount } = await supabase
    .from("scenarios")
    .select("*", { count: "exact", head: true });

  const { count: publishedCount } = await supabase
    .from("scenarios")
    .select("*", { count: "exact", head: true })
    .eq("is_published", true);

  const { count: sessionCount } = await supabase
    .from("scenario_sessions")
    .select("*", { count: "exact", head: true });

  const { count: userCount } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-8">Admin Dashboard</h1>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Total Scenarios
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{scenarioCount || 0}</p>
            <p className="text-sm text-gray-500">
              {publishedCount || 0} published
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Total Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{userCount || 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Total Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{sessionCount || 0}</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="flex gap-4">
          <a
            href="/admin/scenarios"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-white text-sm font-medium hover:bg-primary/90"
          >
            Manage Scenarios
          </a>
        </div>
      </div>
    </div>
  );
}
