import { z } from "zod";

export const optionJsonSchema = z.object({
  option_key: z.string().min(1),
  label: z.string().min(1),
  user_line: z.string(),
  next_node_key: z.string().nullable(),
  tags: z.array(z.string()),
});

export const scoringJsonSchema = z.object({
  option_scores: z.record(
    z.object({
      delta: z.number(),
      risks: z.array(z.string()),
      notes: z.array(z.string()),
    })
  ),
  risk_models: z.record(
    z.object({
      downside_usd_min: z.number(),
      downside_usd_max: z.number(),
      explain: z.string(),
    })
  ),
  outcome: z
    .object({
      type: z.enum(["good", "moderate", "poor"]),
      message: z.string(),
    })
    .optional(),
});

export const scenarioNodeSchema = z.object({
  node_key: z.string().min(1),
  step_index: z.number().int().min(1),
  context: z.string().min(1),
  manager_line: z.string().min(1),
  options_json: z.array(optionJsonSchema),
  scoring_json: scoringJsonSchema,
  is_terminal: z.boolean(),
});

export const scenarioSchema = z.object({
  slug: z
    .string()
    .min(1)
    .max(100)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(1000),
  difficulty: z.number().int().min(1).max(5),
  estimated_minutes: z.number().int().min(1).max(30),
  is_published: z.boolean(),
  is_pro_only: z.boolean(),
});

export const adminScenarioPayloadSchema = z.object({
  scenario: scenarioSchema,
  nodes: z.array(scenarioNodeSchema).min(1),
});

export type OptionJsonInput = z.infer<typeof optionJsonSchema>;
export type ScoringJsonInput = z.infer<typeof scoringJsonSchema>;
export type ScenarioNodeInput = z.infer<typeof scenarioNodeSchema>;
export type ScenarioInput = z.infer<typeof scenarioSchema>;
export type AdminScenarioPayloadInput = z.infer<typeof adminScenarioPayloadSchema>;

// Validation helpers
export function validateScenarioGraph(
  nodes: ScenarioNodeInput[]
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const nodeKeys = new Set(nodes.map((n) => n.node_key));

  // Check for duplicate node keys
  if (nodeKeys.size !== nodes.length) {
    errors.push("Duplicate node keys found");
  }

  // Check that all next_node_key references exist
  for (const node of nodes) {
    for (const option of node.options_json) {
      if (option.next_node_key && !nodeKeys.has(option.next_node_key)) {
        errors.push(
          `Node "${node.node_key}" option "${option.option_key}" references non-existent node "${option.next_node_key}"`
        );
      }
    }
  }

  // Check that terminal nodes have no options or empty options
  for (const node of nodes) {
    if (node.is_terminal && node.options_json.length > 0) {
      // Terminal nodes can have empty options array
      const hasValidOptions = node.options_json.some(
        (o) => o.option_key && o.label
      );
      if (hasValidOptions) {
        errors.push(
          `Terminal node "${node.node_key}" should not have options`
        );
      }
    }
  }

  // Check for a start node
  const hasStart = nodes.some((n) => n.node_key === "start");
  if (!hasStart) {
    errors.push('No "start" node found');
  }

  // Check that at least one terminal node exists
  const hasTerminal = nodes.some((n) => n.is_terminal);
  if (!hasTerminal) {
    errors.push("No terminal nodes found");
  }

  return { valid: errors.length === 0, errors };
}
