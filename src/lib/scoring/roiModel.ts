import type { PathEntry, ScoringJson } from "@/types/scenario";
import type { Profile } from "@/types/db";

interface ROIResult {
  baseline_min: number;
  baseline_max: number;
  uplift_min: number;
  uplift_max: number;
  downside_min: number;
  downside_max: number;
  net_impact_min: number;
  net_impact_max: number;
}

// Comp band midpoints for estimation
const COMP_BAND_MIDPOINTS: Record<string, number> = {
  "40-60k": 50000,
  "60-80k": 70000,
  "80-110k": 95000,
  "110-150k": 130000,
  "150-200k": 175000,
  "200k+": 250000,
};

// Baseline raise expectations by company size
const BASELINE_RAISE_PCT: Record<string, { min: number; max: number }> = {
  "1-50": { min: 0.02, max: 0.04 },
  "51-200": { min: 0.025, max: 0.045 },
  "201-1000": { min: 0.03, max: 0.05 },
  "1000+": { min: 0.025, max: 0.04 },
};

export function calculateROI(
  path: PathEntry[],
  nodeScorings: Map<string, ScoringJson>,
  profile: Profile | null,
  readinessScore: number
): ROIResult {
  // Estimate base salary from comp band
  const compBand = profile?.comp_band || "80-110k";
  const baseSalary = COMP_BAND_MIDPOINTS[compBand] || 95000;

  // Baseline raise expectation
  const companySize = profile?.company_size || "201-1000";
  const baselineRaise = BASELINE_RAISE_PCT[companySize] || { min: 0.03, max: 0.05 };

  const baseline_min = Math.round(baseSalary * baselineRaise.min);
  const baseline_max = Math.round(baseSalary * baselineRaise.max);

  // Calculate total downside from risks encountered
  let downside_min = 0;
  let downside_max = 0;

  for (const entry of path) {
    const scoring = nodeScorings.get(entry.node_key);
    if (!scoring) continue;

    const optionScore = scoring.option_scores[entry.option_key];
    if (!optionScore) continue;

    for (const riskKey of optionScore.risks) {
      const riskModel = scoring.risk_models[riskKey];
      if (riskModel) {
        downside_min += riskModel.downside_usd_min;
        downside_max += riskModel.downside_usd_max;
      }
    }
  }

  // Calculate uplift based on readiness score
  // Higher readiness = better negotiation outcome
  const upliftMultiplier = readinessScore / 100;

  // Best case: 2-3x baseline with good negotiation
  // Worst case: just above baseline with poor negotiation
  const potentialUpliftMin = baseline_min * 1.5;
  const potentialUpliftMax = baseline_max * 2.5;

  const uplift_min = Math.round(potentialUpliftMin * upliftMultiplier);
  const uplift_max = Math.round(potentialUpliftMax * upliftMultiplier);

  // Net impact = uplift - downside
  const net_impact_min = uplift_min - downside_max;
  const net_impact_max = uplift_max - downside_min;

  return {
    baseline_min,
    baseline_max,
    uplift_min,
    uplift_max,
    downside_min,
    downside_max,
    net_impact_min,
    net_impact_max,
  };
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function getROISummary(roi: ROIResult): string {
  if (roi.net_impact_min > 0) {
    return `Potential gain: ${formatCurrency(roi.net_impact_min)} - ${formatCurrency(roi.net_impact_max)}`;
  } else if (roi.net_impact_max > 0) {
    return `Potential range: ${formatCurrency(roi.net_impact_min)} to ${formatCurrency(roi.net_impact_max)}`;
  } else {
    return `Risk of loss: ${formatCurrency(Math.abs(roi.net_impact_max))} - ${formatCurrency(Math.abs(roi.net_impact_min))}`;
  }
}
