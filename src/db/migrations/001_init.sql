-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1) profiles
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  role text,
  level text,
  industry text,
  location_country text,
  location_region text,
  company_size text,
  comp_band text,
  risk_tolerance smallint CHECK (risk_tolerance >= 1 AND risk_tolerance <= 5),
  onboarding_completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 2) entitlements
CREATE TABLE public.entitlements (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  plan text NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'past_due', 'canceled', 'trialing')),
  current_period_end timestamptz,
  stripe_customer_id text,
  stripe_subscription_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 3) scenarios
CREATE TABLE public.scenarios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  track text NOT NULL DEFAULT 'raise_promo',
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  difficulty smallint NOT NULL DEFAULT 1 CHECK (difficulty >= 1 AND difficulty <= 5),
  estimated_minutes smallint NOT NULL DEFAULT 4,
  is_published boolean NOT NULL DEFAULT false,
  is_pro_only boolean NOT NULL DEFAULT true,
  weekly_featured_at date,
  version integer NOT NULL DEFAULT 1,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 4) scenario_nodes
CREATE TABLE public.scenario_nodes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scenario_id uuid NOT NULL REFERENCES public.scenarios(id) ON DELETE CASCADE,
  node_key text NOT NULL,
  step_index smallint NOT NULL,
  context text NOT NULL,
  manager_line text NOT NULL,
  options_json jsonb NOT NULL,
  scoring_json jsonb NOT NULL,
  is_terminal boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(scenario_id, node_key)
);

-- 5) scenario_sessions
CREATE TABLE public.scenario_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  scenario_id uuid NOT NULL REFERENCES public.scenarios(id) ON DELETE CASCADE,
  scenario_version integer NOT NULL,
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  current_node_key text NOT NULL,
  path_json jsonb NOT NULL DEFAULT '[]'::jsonb,
  readiness_score smallint CHECK (readiness_score >= 0 AND readiness_score <= 100),
  roi_json jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 6) playbooks
CREATE TABLE public.playbooks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id uuid NOT NULL REFERENCES public.scenario_sessions(id) ON DELETE CASCADE UNIQUE,
  content_json jsonb NOT NULL,
  personalization_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 7) user_actions
CREATE TABLE public.user_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL,
  title text NOT NULL,
  status text NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'done')),
  due_date date,
  notes text,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 8) upcoming_events
CREATE TABLE public.upcoming_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  meeting_date date,
  meeting_type text NOT NULL DEFAULT 'raise_promo',
  constraints_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 9) admin_users
CREATE TABLE public.admin_users (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'admin',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_scenario_sessions_user_id ON public.scenario_sessions(user_id);
CREATE INDEX idx_scenario_sessions_scenario_id ON public.scenario_sessions(scenario_id);
CREATE INDEX idx_scenario_nodes_scenario_id ON public.scenario_nodes(scenario_id);
CREATE INDEX idx_playbooks_user_id ON public.playbooks(user_id);
CREATE INDEX idx_user_actions_user_id ON public.user_actions(user_id);
CREATE INDEX idx_scenarios_is_published ON public.scenarios(is_published);
CREATE INDEX idx_scenarios_weekly_featured ON public.scenarios(weekly_featured_at);

-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entitlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scenario_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scenario_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playbooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.upcoming_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- profiles: user can select/update own row
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- entitlements: user can select own row; service role can update
CREATE POLICY "Users can view own entitlements"
  ON public.entitlements FOR SELECT
  USING (auth.uid() = user_id);

-- scenarios: public can select only is_published=true; admin can CRUD
CREATE POLICY "Anyone can view published scenarios"
  ON public.scenarios FOR SELECT
  USING (is_published = true);

CREATE POLICY "Admins can manage scenarios"
  ON public.scenarios FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()
  ));

-- scenario_nodes: public can select only for published scenarios; admin can CRUD
CREATE POLICY "Anyone can view nodes for published scenarios"
  ON public.scenario_nodes FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.scenarios
    WHERE id = scenario_id AND is_published = true
  ));

CREATE POLICY "Admins can manage scenario nodes"
  ON public.scenario_nodes FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()
  ));

-- scenario_sessions: user can CRUD only own rows
CREATE POLICY "Users can view own sessions"
  ON public.scenario_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own sessions"
  ON public.scenario_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions"
  ON public.scenario_sessions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own sessions"
  ON public.scenario_sessions FOR DELETE
  USING (auth.uid() = user_id);

-- playbooks: user can CRUD only own rows
CREATE POLICY "Users can view own playbooks"
  ON public.playbooks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own playbooks"
  ON public.playbooks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own playbooks"
  ON public.playbooks FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own playbooks"
  ON public.playbooks FOR DELETE
  USING (auth.uid() = user_id);

-- user_actions: user can CRUD only own rows
CREATE POLICY "Users can view own actions"
  ON public.user_actions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own actions"
  ON public.user_actions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own actions"
  ON public.user_actions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own actions"
  ON public.user_actions FOR DELETE
  USING (auth.uid() = user_id);

-- upcoming_events: user can CRUD only own rows
CREATE POLICY "Users can view own events"
  ON public.upcoming_events FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own events"
  ON public.upcoming_events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own events"
  ON public.upcoming_events FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own events"
  ON public.upcoming_events FOR DELETE
  USING (auth.uid() = user_id);

-- admin_users: only admins can select; service role manages
CREATE POLICY "Admins can view admin_users"
  ON public.admin_users FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()
  ));

-- Function to auto-create profile and entitlements on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);

  INSERT INTO public.entitlements (user_id, plan, status)
  VALUES (NEW.id, 'free', 'active');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call handle_new_user on auth.users insert
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_entitlements_updated_at
  BEFORE UPDATE ON public.entitlements
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_scenarios_updated_at
  BEFORE UPDATE ON public.scenarios
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_scenario_nodes_updated_at
  BEFORE UPDATE ON public.scenario_nodes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_scenario_sessions_updated_at
  BEFORE UPDATE ON public.scenario_sessions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_user_actions_updated_at
  BEFORE UPDATE ON public.user_actions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_upcoming_events_updated_at
  BEFORE UPDATE ON public.upcoming_events
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
