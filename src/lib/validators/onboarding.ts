import { z } from "zod";

export const onboardingSchema = z.object({
  full_name: z.string().min(1, "Name is required").max(100),
  role: z.string().min(1, "Role is required").max(100),
  level: z.string().max(50).optional(),
  industry: z.string().max(100).optional(),
  location_country: z.string().max(2).optional(),
  location_region: z.string().max(50).optional(),
  company_size: z
    .enum(["1-50", "51-200", "201-1000", "1000+"])
    .optional(),
  comp_band: z
    .enum(["40-60k", "60-80k", "80-110k", "110-150k", "150-200k", "200k+"])
    .optional(),
  risk_tolerance: z.number().int().min(1).max(5).optional(),
});

export type OnboardingInput = z.infer<typeof onboardingSchema>;

export const COMPANY_SIZE_OPTIONS = [
  { value: "1-50", label: "1-50 employees" },
  { value: "51-200", label: "51-200 employees" },
  { value: "201-1000", label: "201-1000 employees" },
  { value: "1000+", label: "1000+ employees" },
];

export const COMP_BAND_OPTIONS = [
  { value: "40-60k", label: "$40,000 - $60,000" },
  { value: "60-80k", label: "$60,000 - $80,000" },
  { value: "80-110k", label: "$80,000 - $110,000" },
  { value: "110-150k", label: "$110,000 - $150,000" },
  { value: "150-200k", label: "$150,000 - $200,000" },
  { value: "200k+", label: "$200,000+" },
];

export const RISK_TOLERANCE_OPTIONS = [
  { value: 1, label: "Very Conservative" },
  { value: 2, label: "Conservative" },
  { value: 3, label: "Moderate" },
  { value: 4, label: "Assertive" },
  { value: 5, label: "Very Assertive" },
];

export const LEVEL_OPTIONS = [
  { value: "Junior", label: "Junior / Entry Level" },
  { value: "IC2", label: "Mid-Level (IC2 / L3)" },
  { value: "IC3", label: "Senior (IC3 / L4)" },
  { value: "Staff", label: "Staff / IC4 / L5" },
  { value: "Principal", label: "Principal / IC5 / L6" },
  { value: "Manager", label: "Manager" },
  { value: "Director", label: "Director" },
  { value: "VP", label: "VP / Executive" },
];
