import Link from "next/link";
import { redirect } from "next/navigation";
import { Target, TrendingUp, Calendar, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScoreBadge } from "@/components/ScoreBadge";

export const metadata = {
  title: "Dashboard - PressurePlay",
};

export default async function DashboardPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Check if onboarding is complete
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, onboarding_completed_at")
    .eq("id", user.id)
    .single();

  if (!profile?.onboarding_completed_at) {
    redirect("/onboarding");
  }

  // Get recent sessions
  const { data: recentSessions } = await supabase
    .from("scenario_sessions")
    .select(
      `
      id,
      completed_at,
      readiness_score,
      scenarios (title, slug)
    `
    )
    .eq("user_id", user.id)
    .not("completed_at", "is", null)
    .order("completed_at", { ascending: false })
    .limit(3);

  // Get upcoming event
  const { data: upcomingEvent } = await supabase
    .from("upcoming_events")
    .select("meeting_date")
    .eq("user_id", user.id)
    .single();

  // Calculate average readiness score
  const completedSessions = recentSessions?.filter((s) => s.readiness_score) || [];
  const avgScore =
    completedSessions.length > 0
      ? Math.round(
          completedSessions.reduce((sum, s) => sum + (s.readiness_score || 0), 0) /
            completedSessions.length
        )
      : null;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">
          Welcome back, {profile.full_name?.split(" ")[0] || "there"}
        </h1>
        <p className="text-gray-600">Ready to practice?</p>
      </div>

      {/* Quick Stats */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Average Readiness
            </CardTitle>
          </CardHeader>
          <CardContent>
            {avgScore ? (
              <ScoreBadge score={avgScore} size="sm" showLabel={false} />
            ) : (
              <p className="text-gray-500">Complete a scenario to see your score</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500 flex items-center gap-2">
              <Target className="h-4 w-4" />
              Sessions Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{completedSessions.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Next Meeting
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingEvent?.meeting_date ? (
              <p className="text-lg font-semibold">
                {new Date(upcomingEvent.meeting_date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </p>
            ) : (
              <Link href="/actions" className="text-primary hover:underline text-sm">
                Set a date
              </Link>
            )}
          </CardContent>
        </Card>
      </div>

      {/* CTA */}
      <Card className="mb-8 bg-gradient-to-r from-blue-50 to-purple-50 border-none">
        <CardContent className="py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold mb-2">Ready to practice?</h2>
              <p className="text-gray-600">
                Pick a scenario and sharpen your negotiation skills.
              </p>
            </div>
            <Link href="/library">
              <Button size="lg">
                Browse Scenarios
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Recent Sessions */}
      {recentSessions && recentSessions.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4">Recent Practice</h2>
          <div className="space-y-3">
            {recentSessions.map((session: any) => (
              <Card key={session.id}>
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{session.scenarios?.title}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(session.completed_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      {session.readiness_score && (
                        <ScoreBadge
                          score={session.readiness_score}
                          size="sm"
                          showLabel={false}
                        />
                      )}
                      <Link href={`/playbook/${session.id}`}>
                        <Button variant="outline" size="sm">
                          View Playbook
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
