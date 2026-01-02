import Link from "next/link";
import { Lock, Clock, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ScenarioCardProps {
  id: string;
  title: string;
  description: string;
  difficulty: number;
  estimatedMinutes: number;
  isLocked: boolean;
  isWeeklyFree?: boolean;
}

export function ScenarioCard({
  id,
  title,
  description,
  difficulty,
  estimatedMinutes,
  isLocked,
  isWeeklyFree,
}: ScenarioCardProps) {
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
    <Card
      className={cn(
        "relative transition-shadow hover:shadow-md",
        isLocked && "opacity-75"
      )}
    >
      {isWeeklyFree && (
        <div className="absolute -top-2 -right-2">
          <Badge className="bg-primary">Free This Week</Badge>
        </div>
      )}

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg">{title}</CardTitle>
          {isLocked && <Lock className="h-5 w-5 text-gray-400 shrink-0" />}
        </div>
      </CardHeader>

      <CardContent>
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{description}</p>

        <div className="flex items-center gap-3 mb-4">
          <Badge variant="outline" className={difficultyColors[difficulty]}>
            {difficultyLabels[difficulty]}
          </Badge>
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <Clock className="h-4 w-4" />
            {estimatedMinutes} min
          </div>
        </div>

        {isLocked ? (
          <Link href="/upgrade">
            <Button variant="outline" className="w-full">
              <Lock className="h-4 w-4 mr-2" />
              Unlock with Pro
            </Button>
          </Link>
        ) : (
          <Link href={`/scenario/${id}`}>
            <Button className="w-full">
              <Zap className="h-4 w-4 mr-2" />
              Start Practice
            </Button>
          </Link>
        )}
      </CardContent>
    </Card>
  );
}
