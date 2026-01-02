import type { Profile } from "@/types/db";

// Anchor range templates based on comp band and location
const ANCHOR_RANGES: Record<string, Record<string, string>> = {
  "40-60k": {
    default: "$55,000-$65,000",
    CA: "$60,000-$72,000",
    NY: "$58,000-$70,000",
    TX: "$52,000-$62,000",
  },
  "60-80k": {
    default: "$75,000-$90,000",
    CA: "$82,000-$98,000",
    NY: "$80,000-$95,000",
    TX: "$70,000-$85,000",
  },
  "80-110k": {
    default: "$100,000-$125,000",
    CA: "$115,000-$140,000",
    NY: "$110,000-$135,000",
    TX: "$95,000-$118,000",
  },
  "110-150k": {
    default: "$140,000-$175,000",
    CA: "$160,000-$195,000",
    NY: "$155,000-$190,000",
    TX: "$130,000-$165,000",
  },
  "150-200k": {
    default: "$180,000-$220,000",
    CA: "$200,000-$250,000",
    NY: "$195,000-$240,000",
    TX: "$170,000-$210,000",
  },
  "200k+": {
    default: "$230,000-$280,000",
    CA: "$260,000-$320,000",
    NY: "$250,000-$310,000",
    TX: "$220,000-$270,000",
  },
};

// Risk tolerance affects language
const RISK_LANGUAGE: Record<number, { opener: string; closer: string }> = {
  1: {
    opener: "I wanted to carefully discuss",
    closer: "if that's something we could explore",
  },
  2: {
    opener: "I'd like to discuss",
    closer: "and would appreciate your thoughts",
  },
  3: {
    opener: "I want to discuss",
    closer: "and see what's possible",
  },
  4: {
    opener: "I'm here to discuss",
    closer: "and I'm confident we can find alignment",
  },
  5: {
    opener: "I need to address",
    closer: "and I'm looking for a concrete path forward",
  },
};

export function getAnchorRange(profile: Profile | null): string {
  const compBand = profile?.comp_band || "80-110k";
  const region = profile?.location_region || "default";

  const ranges = ANCHOR_RANGES[compBand] || ANCHOR_RANGES["80-110k"];
  return ranges[region] || ranges.default;
}

export function getRiskLanguage(
  profile: Profile | null
): { opener: string; closer: string } {
  const tolerance = profile?.risk_tolerance || 3;
  return RISK_LANGUAGE[tolerance] || RISK_LANGUAGE[3];
}

export function getLevelTitle(profile: Profile | null): string {
  const level = profile?.level?.toLowerCase() || "";
  const role = profile?.role || "professional";

  if (level.includes("senior") || level.includes("ic3") || level.includes("l4")) {
    return `Senior ${role}`;
  }
  if (level.includes("staff") || level.includes("ic4") || level.includes("l5")) {
    return `Staff ${role}`;
  }
  if (level.includes("principal") || level.includes("ic5") || level.includes("l6")) {
    return `Principal ${role}`;
  }
  if (level.includes("junior") || level.includes("ic1") || level.includes("l1")) {
    return `Junior ${role}`;
  }
  return role;
}

export function getCompanySizeContext(profile: Profile | null): string {
  const size = profile?.company_size || "201-1000";

  switch (size) {
    case "1-50":
      return "In a startup environment, there's often more flexibility in compensation structure. Consider equity as part of the conversation.";
    case "51-200":
      return "At this company size, there may be some process but usually more flexibility than larger companies. Your manager may have direct budget control.";
    case "201-1000":
      return "Mid-size companies typically have formal comp bands but some flexibility. Work with your manager to navigate the approval process.";
    case "1000+":
      return "Large companies have structured processes. Focus on getting the right level/band placement as that drives long-term comp.";
    default:
      return "";
  }
}

export function getIndustryContext(profile: Profile | null): string {
  const industry = profile?.industry?.toLowerCase() || "";

  if (industry.includes("tech") || industry.includes("software")) {
    return "Tech companies often have more flexibility in total comp structure (base, equity, bonus). Consider the full package.";
  }
  if (industry.includes("finance") || industry.includes("banking")) {
    return "Financial services typically have structured bonus cycles. Time your ask around performance review periods.";
  }
  if (industry.includes("consulting")) {
    return "Consulting firms often tie comp to utilization and project performance. Reference specific client wins.";
  }
  return "";
}
