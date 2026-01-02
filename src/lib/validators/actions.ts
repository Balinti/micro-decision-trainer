import { z } from "zod";

export const createActionSchema = z.object({
  type: z.string().min(1).max(100),
  title: z.string().min(1).max(500),
  due_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
});

export const updateActionSchema = z.object({
  status: z.enum(["todo", "done"]).optional(),
  title: z.string().min(1).max(500).optional(),
  due_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
});

export type CreateActionInput = z.infer<typeof createActionSchema>;
export type UpdateActionInput = z.infer<typeof updateActionSchema>;

// Default action templates that can be suggested to users
export const DEFAULT_ACTION_TEMPLATES = [
  {
    type: "research_benchmarks",
    title: "Research market compensation benchmarks",
    notes:
      "Use Levels.fyi, Glassdoor, or industry surveys to understand your market rate.",
  },
  {
    type: "schedule_manager_meeting",
    title: "Schedule 1:1 with manager to discuss compensation",
    notes:
      "Choose a time when you both have energy. Avoid Fridays or right before deadlines.",
  },
  {
    type: "prep_brag_doc",
    title: "Update your brag document with recent wins",
    notes:
      "List specific accomplishments with metrics: revenue impact, time saved, projects delivered.",
  },
  {
    type: "gather_peer_feedback",
    title: "Collect positive peer feedback for your case",
    notes:
      "Ask 2-3 colleagues for specific examples of your impact they've witnessed.",
  },
  {
    type: "practice_scenarios",
    title: "Practice negotiation scenarios on PressurePlay",
    notes: "Run through at least 3 scenarios before your actual conversation.",
  },
  {
    type: "draft_talking_points",
    title: "Draft your opening talking points",
    notes:
      "Prepare your opening statement: impact summary, market data, specific ask.",
  },
  {
    type: "identify_batna",
    title: "Identify your BATNA (Best Alternative)",
    notes:
      "Know what you'll do if the conversation doesn't go well. External offers? Stay and wait? Other options?",
  },
  {
    type: "review_comp_history",
    title: "Review your compensation history",
    notes:
      "Look at your starting salary, raises received, and how they compare to inflation and market.",
  },
  {
    type: "set_meeting_agenda",
    title: "Share agenda with manager before the meeting",
    notes:
      "Let them know you want to discuss compensation so they can prepare and it's not a surprise.",
  },
  {
    type: "post_meeting_followup",
    title: "Send follow-up email after compensation discussion",
    notes: "Document what was discussed and agreed upon in writing.",
  },
];
