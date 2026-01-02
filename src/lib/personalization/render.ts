import type { Profile } from "@/types/db";
import {
  getAnchorRange,
  getRiskLanguage,
  getLevelTitle,
  getCompanySizeContext,
  getIndustryContext,
} from "./templates";

interface PersonalizationContext {
  role: string;
  level: string;
  location_region: string;
  anchor_range: string;
  risk_opener: string;
  risk_closer: string;
  level_title: string;
  company_context: string;
  industry_context: string;
  full_name: string;
  manager_name: string;
}

export function buildPersonalizationContext(
  profile: Profile | null
): PersonalizationContext {
  const riskLanguage = getRiskLanguage(profile);

  return {
    role: profile?.role || "your role",
    level: profile?.level || "",
    location_region: profile?.location_region || "your region",
    anchor_range: getAnchorRange(profile),
    risk_opener: riskLanguage.opener,
    risk_closer: riskLanguage.closer,
    level_title: getLevelTitle(profile),
    company_context: getCompanySizeContext(profile),
    industry_context: getIndustryContext(profile),
    full_name: profile?.full_name || "there",
    manager_name: "[Manager Name]",
  };
}

export function renderTemplate(
  template: string,
  context: PersonalizationContext
): string {
  let result = template;

  // Replace all {variable} patterns with context values
  for (const [key, value] of Object.entries(context)) {
    const pattern = new RegExp(`\\{${key}\\}`, "g");
    result = result.replace(pattern, value);
  }

  return result;
}

export function renderUserLine(
  userLine: string,
  profile: Profile | null
): string {
  const context = buildPersonalizationContext(profile);
  return renderTemplate(userLine, context);
}

export interface PlaybookContent {
  talking_points: string[];
  followup_email: string;
  fallback_plan: string[];
  red_flags: string[];
}

export function generatePlaybook(
  profile: Profile | null,
  readinessScore: number,
  risks: Array<{ riskKey: string; betterDefault: string }>,
  isPersonalized: boolean
): PlaybookContent {
  const context = buildPersonalizationContext(profile);

  // Base talking points
  const talking_points = [
    `Open: "${context.risk_opener} my compensation and growth trajectory."`,
    `Impact Summary: Lead with your quantified contributions and business impact.`,
    `Market Anchor: "Based on market data for ${context.level_title} in ${context.location_region}, I'm seeing ranges of ${context.anchor_range}."`,
    `Ask: "How flexible is the band for strong performance?" or "What would it take to reach the next level?"`,
  ];

  if (isPersonalized && context.company_context) {
    talking_points.push(`Context: ${context.company_context}`);
  }

  // Followup email template
  const followup_email = `Subject: Following up on our compensation discussion

Hi ${context.manager_name},

Thank you for taking the time to discuss my compensation and growth path today. I wanted to follow up and document what we discussed.

Key points from our conversation:
- [Summarize the key agreements or next steps]
- [Note any timeline commitments]
- [Reference any action items]

I'm committed to continuing to deliver impact for the team and appreciate your advocacy.

${isPersonalized ? `As discussed, I'll focus on [specific growth areas] as we work toward [agreed goal].` : ""}

Best,
${context.full_name}`;

  // Fallback plans based on score
  const fallback_plan = [];
  if (readinessScore < 60) {
    fallback_plan.push(
      "If budget is truly fixed: Ask for a documented timeline and criteria for revisiting."
    );
    fallback_plan.push(
      "Consider non-monetary value: Title, scope, flexibility, development budget."
    );
  }
  fallback_plan.push(
    "If conversation stalls: 'What would need to be true for this to be possible next cycle?'"
  );
  fallback_plan.push(
    "If answer is vague: Ask for specific milestones and a written commitment to review."
  );

  // Red flags to watch for
  const red_flags = [
    "Manager refuses to discuss specific criteria or timeline.",
    "Promises without documentation or commitment to review dates.",
    "Deflection to 'company policy' without exploring alternatives.",
    "'You should just be grateful' or similar dismissive responses.",
  ];

  // Add personalized risk-based recommendations
  if (isPersonalized && risks.length > 0) {
    for (const risk of risks) {
      red_flags.push(`Watch out: ${risk.betterDefault}`);
    }
  }

  return {
    talking_points,
    followup_email,
    fallback_plan,
    red_flags,
  };
}

export function generateGenericPlaybook(): PlaybookContent {
  return {
    talking_points: [
      "Open with your impact summary - lead with quantified contributions.",
      "Use market data to anchor your ask in a range, not a specific number.",
      "Ask calibrating questions: 'How flexible is the band?'",
      "Be prepared to discuss alternatives if budget is constrained.",
    ],
    followup_email:
      "Upgrade to Pro for a personalized follow-up email template based on your profile.",
    fallback_plan: [
      "If budget is fixed, explore title, scope, or timeline commitments.",
      "Ask for a documented path to your target compensation.",
    ],
    red_flags: [
      "Vague promises without specific timelines or criteria.",
      "Dismissive responses about compensation discussions.",
    ],
  };
}
