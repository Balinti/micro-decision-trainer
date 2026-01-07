import type { PathEntry, ScoringJson } from "@/types/scenario";

interface ReadinessResult {
  score: number;
  breakdown: {
    baseScore: number;
    riskPenalty: number;
    consistencyBonus: number;
  };
  risks: Array<{
    riskKey: string;
    label: string;
    typicalDownside: { min: number; max: number };
    betterDefault: string;
  }>;
}

export function calculateReadinessScore(
  path: PathEntry[],
  nodeScorings: Map<string, ScoringJson>
): ReadinessResult {
  let totalDelta = 0;
  const risksEncountered: Map<
    string,
    { count: number; model: ScoringJson["risk_models"][string] }
  > = new Map();

  // Calculate base score from path choices
  for (const entry of path) {
    const scoring = nodeScorings.get(entry.node_key);
    if (!scoring) continue;

    const optionScore = scoring.option_scores[entry.option_key];
    if (!optionScore) continue;

    totalDelta += optionScore.delta;

    // Track risks
    for (const riskKey of optionScore.risks) {
      const riskModel = scoring.risk_models[riskKey];
      if (riskModel) {
        const existing = risksEncountered.get(riskKey);
        if (existing) {
          existing.count += 1;
        } else {
          risksEncountered.set(riskKey, { count: 1, model: riskModel });
        }
      }
    }
  }

  // Base score starts at 50 and adjusts based on deltas
  // Max delta per step is roughly +15, so with 6 steps, max is ~90
  // Min delta per step is roughly -20, so with 6 steps, min is ~-120
  const baseScore = Math.min(100, Math.max(0, 50 + totalDelta));

  // Risk penalty: each risk encountered reduces score
  let riskPenalty = 0;
  Array.from(risksEncountered.values()).forEach(({ count }) => {
    riskPenalty += count * 5;
  });

  // Consistency bonus: if no major risks and good choices
  const consistencyBonus =
    risksEncountered.size === 0 && totalDelta > 20 ? 10 : 0;

  const finalScore = Math.min(
    100,
    Math.max(0, baseScore - riskPenalty + consistencyBonus)
  );

  // Format risks for display
  const risks = Array.from(risksEncountered.entries()).map(
    ([riskKey, { model }]) => ({
      riskKey,
      label: `Risk: ${riskKey.replace(/_/g, " ")}`,
      typicalDownside: {
        min: model.downside_usd_min,
        max: model.downside_usd_max,
      },
      betterDefault: model.explain,
    })
  );

  return {
    score: Math.round(finalScore),
    breakdown: {
      baseScore: Math.round(baseScore),
      riskPenalty: Math.round(riskPenalty),
      consistencyBonus,
    },
    risks,
  };
}

export function getReadinessLabel(score: number): string {
  if (score >= 85) return "Excellent";
  if (score >= 70) return "Good";
  if (score >= 55) return "Moderate";
  if (score >= 40) return "Needs Work";
  return "High Risk";
}

export function getReadinessColor(score: number): string {
  if (score >= 85) return "text-green-600";
  if (score >= 70) return "text-blue-600";
  if (score >= 55) return "text-yellow-600";
  if (score >= 40) return "text-orange-600";
  return "text-red-600";
}
