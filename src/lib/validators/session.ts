import { z } from "zod";

export const startSessionSchema = z.object({
  scenario_id: z.string().uuid(),
});

export const answerSchema = z.object({
  option_key: z.string().min(1),
});

export type StartSessionInput = z.infer<typeof startSessionSchema>;
export type AnswerInput = z.infer<typeof answerSchema>;
