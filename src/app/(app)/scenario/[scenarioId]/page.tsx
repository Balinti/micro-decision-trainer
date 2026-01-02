import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Clock, Zap } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ScenarioPageProps {
  params: { scenarioId: string };
}

export async function generateMetadata({ params }: ScenarioPageProps) {
  const supabase = createClient();

  const { data: scenario } = await supabase
    .from("scenarios")
    .select("title, description")
    .eq("id", params.scenarioId)
    .single();

  return {
    title: scenario ? `${scenario.title} - PressurePlay` : "Scenario - PressurePlay",
    description: scenario?.description,
  };
}

export default async function ScenarioPage({ params }: ScenarioPageProps) {
  const supabase = createClient();
  const { scenarioId } = params;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: scenario, error } = await supabase
    .from("scenarios")
    .select("*")
    .eq("id", scenarioId)
    .eq("is_published", true)
    .single();

  if (error || !scenario) {
    notFound();
  }

  const difficultyLabels = ["", "Easy", "Easy-Medium", "Medium", "Medium-Hard", "Hard"];
  const difficultyColors = [
    "",
    "bg-green-100 text-green-800",
    "bg-lime-100 text-lime-800",
    "bg-yellow-100 text-yellow-800",
    "bg-orange-100 text-orange-800",
    "bg-red-100 text-red-800",
  ];

  return (
    <div className="max-w-2xl mx-auto">
      <Link
        href="/library"
        className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Library
      </Link>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <CardTitle className="text-2xl">{scenario.title}</CardTitle>
            <Badge variant="outline" className={difficultyColors[scenario.difficulty]}>
              {difficultyLabels[scenario.difficulty]}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-gray-600">{scenario.description}</p>

          <div className="flex items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {scenario.estimated_minutes} minutes
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="font-semibold mb-2">What you'll practice:</h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Responding to common manager objections</li>
              <li>• Using calibrated questions effectively</li>
              <li>• Anchoring with market data</li>
              <li>• Finding creative alternatives</li>
            </ul>
          </div>

          <form action={`/api/sessions`} method="POST">
            <input type="hidden" name="scenario_id" value={scenarioId} />
            <StartButton scenarioId={scenarioId} />
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function StartButton({ scenarioId }: { scenarioId: string }) {
  return (
    <form
      action={async () => {
        "use server";
        // This is handled client-side instead
      }}
    >
      <Link href={`/session/${scenarioId}/start`}>
        <Button size="lg" className="w-full">
          <Zap className="mr-2 h-5 w-5" />
          Start Practice
        </Button>
      </Link>
    </form>
  );
}
