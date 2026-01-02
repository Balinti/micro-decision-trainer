export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: string | null;
  level: string | null;
  industry: string | null;
  location_country: string | null;
  location_region: string | null;
  company_size: string | null;
  comp_band: string | null;
  risk_tolerance: number | null;
  onboarding_completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Entitlement {
  user_id: string;
  plan: "free" | "pro";
  status: "active" | "past_due" | "canceled" | "trialing";
  current_period_end: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Scenario {
  id: string;
  track: string;
  slug: string;
  title: string;
  description: string;
  difficulty: number;
  estimated_minutes: number;
  is_published: boolean;
  is_pro_only: boolean;
  weekly_featured_at: string | null;
  version: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface ScenarioNode {
  id: string;
  scenario_id: string;
  node_key: string;
  step_index: number;
  context: string;
  manager_line: string;
  options_json: OptionJson[];
  scoring_json: ScoringJsonDb;
  is_terminal: boolean;
  created_at: string;
  updated_at: string;
}

export interface OptionJson {
  option_key: string;
  label: string;
  user_line: string;
  next_node_key: string | null;
  tags: string[];
}

export interface ScoringJsonDb {
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

export interface ScenarioSession {
  id: string;
  user_id: string;
  scenario_id: string;
  scenario_version: number;
  started_at: string;
  completed_at: string | null;
  current_node_key: string;
  path_json: PathEntryDb[];
  readiness_score: number | null;
  roi_json: ROIJsonDb | null;
  created_at: string;
  updated_at: string;
}

export interface PathEntryDb {
  node_key: string;
  option_key: string;
  answered_at: string;
}

export interface ROIJsonDb {
  uplift_min: number;
  uplift_max: number;
  downside_min: number;
  downside_max: number;
  baseline_min: number;
  baseline_max: number;
}

export interface Playbook {
  id: string;
  user_id: string;
  session_id: string;
  content_json: PlaybookContentDb;
  personalization_json: Record<string, unknown>;
  created_at: string;
}

export interface PlaybookContentDb {
  talking_points: string[];
  followup_email: string;
  fallback_plan: string[];
  red_flags: string[];
}

export interface UserAction {
  id: string;
  user_id: string;
  type: string;
  title: string;
  status: "todo" | "done";
  due_date: string | null;
  notes: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface UpcomingEvent {
  id: string;
  user_id: string;
  meeting_date: string | null;
  meeting_type: string;
  constraints_json: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface AdminUser {
  user_id: string;
  role: string;
  created_at: string;
}

// Database types for Supabase
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, "created_at" | "updated_at">;
        Update: Partial<Omit<Profile, "id" | "created_at">>;
      };
      entitlements: {
        Row: Entitlement;
        Insert: Omit<Entitlement, "created_at" | "updated_at">;
        Update: Partial<Omit<Entitlement, "user_id" | "created_at">>;
      };
      scenarios: {
        Row: Scenario;
        Insert: Omit<Scenario, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Scenario, "id" | "created_at">>;
      };
      scenario_nodes: {
        Row: ScenarioNode;
        Insert: Omit<ScenarioNode, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<ScenarioNode, "id" | "created_at">>;
      };
      scenario_sessions: {
        Row: ScenarioSession;
        Insert: Omit<ScenarioSession, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<ScenarioSession, "id" | "created_at">>;
      };
      playbooks: {
        Row: Playbook;
        Insert: Omit<Playbook, "id" | "created_at">;
        Update: Partial<Omit<Playbook, "id" | "created_at">>;
      };
      user_actions: {
        Row: UserAction;
        Insert: Omit<UserAction, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<UserAction, "id" | "created_at">>;
      };
      upcoming_events: {
        Row: UpcomingEvent;
        Insert: Omit<UpcomingEvent, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<UpcomingEvent, "id" | "created_at">>;
      };
      admin_users: {
        Row: AdminUser;
        Insert: Omit<AdminUser, "created_at">;
        Update: Partial<Omit<AdminUser, "user_id" | "created_at">>;
      };
    };
  };
};
