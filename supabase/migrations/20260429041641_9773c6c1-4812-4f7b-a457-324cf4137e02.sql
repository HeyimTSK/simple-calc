-- Family members (spouse full, children/parents lightweight)
CREATE TABLE public.family_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  relation TEXT NOT NULL CHECK (relation IN ('spouse','child','parent')),
  name TEXT NOT NULL,
  age INTEGER NOT NULL DEFAULT 0,
  -- spouse fields
  monthly_income NUMERIC NOT NULL DEFAULT 0,
  monthly_expenses NUMERIC NOT NULL DEFAULT 0,
  investments NUMERIC NOT NULL DEFAULT 0,
  insurance_type TEXT NOT NULL DEFAULT 'none',
  -- child fields
  education_goal TEXT,
  education_target_year INTEGER,
  -- parent fields
  monthly_medical_expense NUMERIC NOT NULL DEFAULT 0,
  has_health_insurance BOOLEAN NOT NULL DEFAULT false,
  dependency_level TEXT DEFAULT 'partial',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own family select" ON public.family_members FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own family insert" ON public.family_members FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own family update" ON public.family_members FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "own family delete" ON public.family_members FOR DELETE USING (auth.uid() = user_id);
CREATE TRIGGER trg_family_members_updated BEFORE UPDATE ON public.family_members FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE INDEX idx_family_members_user ON public.family_members(user_id);

-- Assets
CREATE TABLE public.assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  type TEXT NOT NULL,
  name TEXT NOT NULL,
  current_value NUMERIC NOT NULL DEFAULT 0,
  owner TEXT NOT NULL DEFAULT 'self',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own assets select" ON public.assets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own assets insert" ON public.assets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own assets update" ON public.assets FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "own assets delete" ON public.assets FOR DELETE USING (auth.uid() = user_id);
CREATE TRIGGER trg_assets_updated BEFORE UPDATE ON public.assets FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE INDEX idx_assets_user ON public.assets(user_id);

-- Liabilities
CREATE TABLE public.liabilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  type TEXT NOT NULL,
  name TEXT NOT NULL,
  outstanding NUMERIC NOT NULL DEFAULT 0,
  emi NUMERIC NOT NULL DEFAULT 0,
  interest_rate NUMERIC NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.liabilities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own liab select" ON public.liabilities FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own liab insert" ON public.liabilities FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own liab update" ON public.liabilities FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "own liab delete" ON public.liabilities FOR DELETE USING (auth.uid() = user_id);
CREATE TRIGGER trg_liab_updated BEFORE UPDATE ON public.liabilities FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE INDEX idx_liab_user ON public.liabilities(user_id);

-- Expenses (daily entries)
CREATE TABLE public.expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  category TEXT NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  note TEXT,
  payment_method TEXT DEFAULT 'other',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own exp select" ON public.expenses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own exp insert" ON public.expenses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own exp update" ON public.expenses FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "own exp delete" ON public.expenses FOR DELETE USING (auth.uid() = user_id);
CREATE INDEX idx_exp_user_date ON public.expenses(user_id, date DESC);

-- Goals
CREATE TABLE public.goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  type TEXT NOT NULL,
  name TEXT NOT NULL,
  target_year INTEGER NOT NULL,
  current_cost NUMERIC NOT NULL DEFAULT 0,
  inflation_rate NUMERIC NOT NULL DEFAULT 6,
  expected_return NUMERIC NOT NULL DEFAULT 10,
  current_savings NUMERIC NOT NULL DEFAULT 0,
  monthly_contribution NUMERIC NOT NULL DEFAULT 0,
  linked_member_id UUID REFERENCES public.family_members(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own goals select" ON public.goals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own goals insert" ON public.goals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own goals update" ON public.goals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "own goals delete" ON public.goals FOR DELETE USING (auth.uid() = user_id);
CREATE TRIGGER trg_goals_updated BEFORE UPDATE ON public.goals FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE INDEX idx_goals_user ON public.goals(user_id);

-- Extend financial_profiles with life-planning fields
ALTER TABLE public.financial_profiles
  ADD COLUMN IF NOT EXISTS current_age INTEGER NOT NULL DEFAULT 30,
  ADD COLUMN IF NOT EXISTS retirement_age INTEGER NOT NULL DEFAULT 60,
  ADD COLUMN IF NOT EXISTS life_expectancy INTEGER NOT NULL DEFAULT 85,
  ADD COLUMN IF NOT EXISTS risk_profile TEXT NOT NULL DEFAULT 'medium';