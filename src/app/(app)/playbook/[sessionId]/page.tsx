import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Share2, TrendingUp, TrendingDown } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScoreBadge } from "@/components/ScoreBadge";
import { RiskFeedbackList } from "@/components/RiskFeedbackList";
import { PlaybookViewer } from "@/components/PlaybookViewer";
import { PaywallGate } from "@/components/PaywallGate";
import { formatCurrency } from "@/lib/scoring/roiModel";

interface PlaybookPageProps {
  params: { sessionId: string };
}

export const metadata = {
  title: "Your Playbook - PressurePlay",
};

export default async function PlaybookPage({ params }: PlaybookPageProps) {
  const supabase = createClient();
  const { sessionId } = params;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get session with scenario
  const { data: session, error } = await supabase
    .from("scenario_sessions")
    .select(
      `
      *,
      scenarios (title, slug)
    `
    )
    .eq("id", sessionId)
    .eq("user_id", user.id)
    .single();

  if (error || !session) {
    notFound();
  }

  // Get playbook
  const { data: playbook } = await supabase
    .from("playbooks")
    .select("*")
    .eq("session_id", sessionId)
    .single();

  // Get entitlements
  const { data: entitlements } = await supabase
    .from("entitlements")
    .select("plan, status")
    .eq("user_id", user.id)
    .single();

  const isPro =
    entitlements?.status === "active" && entitlements?.plan === "pro";

  // Calculate risks from session data
  const risks: any[] = [];
  const roi = session.roi_json;

  return (
    <div className="max-w-3xl mx-auto">
      <Link
        href="/library"
        className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Library
      </Link>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Your Playbook</h1>
        <p className="text-gray-600">{session.scenarios?.title}</p>
      </div>

      {/* Score Section */}
      <Card className="mb-8">
        <CardContent className="py-8">
          <div className="flex flex-col md:flex-row items-center justify-center gap-8">
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-2">Readiness Score</p>
              <ScoreBadge score={session.readiness_score || 0} size="lg" />
            </div>

            {isPro && roi && (
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-2">Estimated Impact</p>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1 text-green-600">
                    <TrendingUp className="h-5 w-5" />
                    <span className="font-bold">
                      {formatCurrency(roi.uplift_min)} - {formatCurrency(roi.uplift_max)}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  vs baseline of {formatCurrency(roi.baseline_min)} -{" "}
                  {formatCurrency(roi.baseline_max)}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ROI Paywall for Free Users */}
      {!isPro && (
        <div className="mb-8">
          <PaywallGate
            reason="unlock_roi"
            featureName="ROI Estimates"
          >
            <p className="text-sm text-gray-600">
              See how much your negotiation decisions could be worth.
            </p>
          </PaywallGate>
        </div>
      )}

      {/* Risk Feedback */}
      {risks.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Areas to Improve</h2>
          <RiskFeedbackList risks={risks} />
        </div>
      )}

      {/* Playbook Content */}
      {playbook ? (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Your Playbook</h2>
          {isPro ? (
            <PlaybookViewer
              content={playbook.content_json as any}
              isPersonalized={true}
            />
          ) : (
            <>
              <PlaybookViewer
                content={playbook.content_json as any}
                isPersonalized={false}
              />
              <div className="mt-6">
                <PaywallGate
                  reason="unlock_playbook"
                  featureName="Personalized Playbook"
                >
                  <p className="text-sm text-gray-600">
                    Get talking points tailored to your role, level, and location.
                  </p>
                </PaywallGate>
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          Playbook not available.
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col md:flex-row gap-4">
        <Link href="/library" className="flex-1">
          <Button variant="outline" className="w-full">
            Practice Another Scenario
          </Button>
        </Link>
        <Link href="/actions" className="flex-1">
          <Button className="w-full">Plan Your Next Steps</Button>
        </Link>
      </div>
    </div>
  );
}
