// Client-side types for scenarios (subset of DB types)

export interface ScenarioListItem {
  id: string;
  title: string;
  description: string;
  difficulty: number;
  estimated_minutes: number;
  is_pro_only: boolean;
  is_locked: boolean;
}

export interface ScenarioDetail {
  id: string;
  title: string;
  description: string;
  difficulty: number;
  estimated_minutes: number;
  is_pro_only: boolean;
  is_published: boolean;
}

export interface Option {
  option_key: string;
  label: string;
  user_line?: string;
}

export interface NodeDisplay {
  node_key: string;
  step_index: number;
  context: string;
  manager_line: string;
  options: Option[];
  is_terminal: boolean;
}

export interface SessionState {
  id: string;
  scenario_id: string;
  current_node_key: string;
  readiness_score: number | null;
  completed_at: string | null;
}

export interface PathEntry {
  node_key: string;
  option_key: string;
  answered_at: string;
}

export interface ScoringJson {
  option_scores: Record<
    string,
    {
      delta: number;
      risks: string[];
      notes: string[];
    }
  >;
  risk_models: Record<
    string,
    {
      downside_usd_min: number;
      downside_usd_max: number;
      explain: string;
    }
  >;
  outcome?: {
    type: "good" | "moderate" | "poor";
    message: string;
  };
}

export interface RiskFeedback {
  risk_key: string;
  label: string;
  typical_downside: {
    min: number;
    max: number;
  };
  better_default: string;
}

export interface ROI {
  baseline_min: number;
  baseline_max: number;
  uplift_min: number;
  uplift_max: number;
  downside_min: number;
  downside_max: number;
}

export interface PlaybookContent {
  talking_points: string[];
  followup_email: string;
  fallback_plan: string[];
  red_flags: string[];
}

export interface CompletionResult {
  completed: boolean;
  readiness_score: number;
  roi?: ROI;
  top_risks: RiskFeedback[];
  playbook_url: string;
  paywall?: {
    locked_features: string[];
    upgrade_url: string;
  };
}

export interface GatingResult {
  is_locked: boolean;
  reason: string | null;
}

// Admin types
export interface AdminScenarioPayload {
  scenario: {
    slug: string;
    title: string;
    description: string;
    difficulty: number;
    estimated_minutes: number;
    is_published: boolean;
    is_pro_only: boolean;
  };
  nodes: Array<{
    node_key: string;
    step_index: number;
    context: string;
    manager_line: string;
    options_json: Array<{
      option_key: string;
      label: string;
      user_line: string;
      next_node_key: string | null;
      tags: string[];
    }>;
    scoring_json: ScoringJson;
    is_terminal: boolean;
  }>;
}
