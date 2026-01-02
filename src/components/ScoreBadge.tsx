import { cn } from "@/lib/utils";
import { getReadinessLabel, getReadinessColor } from "@/lib/scoring/readiness";

interface ScoreBadgeProps {
  score: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

export function ScoreBadge({
  score,
  size = "md",
  showLabel = true,
}: ScoreBadgeProps) {
  const label = getReadinessLabel(score);
  const colorClass = getReadinessColor(score);

  const sizeClasses = {
    sm: "w-12 h-12 text-lg",
    md: "w-16 h-16 text-2xl",
    lg: "w-24 h-24 text-4xl",
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={cn(
          "rounded-full border-4 flex items-center justify-center font-bold",
          sizeClasses[size],
          colorClass,
          score >= 70 ? "border-green-200" : score >= 40 ? "border-yellow-200" : "border-red-200"
        )}
      >
        {score}
      </div>
      {showLabel && (
        <span className={cn("font-medium", colorClass)}>{label}</span>
      )}
    </div>
  );
}
