import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import type { FinancialProfile } from "@/lib/finance";

export type FullFinancialProfile = FinancialProfile & {
  id: string;
  user_id: string;
  onboarding_completed: boolean;
};

export const useFinancialProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<FullFinancialProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from("financial_profiles")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();
    if (!error && data) {
      setProfile({
        ...data,
        monthly_salary: Number(data.monthly_salary),
        rent: Number(data.rent),
        food: Number(data.food),
        utilities: Number(data.utilities),
        family_support: Number(data.family_support),
        existing_loans: Number(data.existing_loans),
        emi_amount: Number(data.emi_amount),
        savings: Number(data.savings),
        investments: Number(data.investments),
        emergency_fund_amount: Number(data.emergency_fund_amount),
        current_age: (data as any).current_age ?? 30,
        retirement_age: (data as any).retirement_age ?? 60,
        life_expectancy: (data as any).life_expectancy ?? 85,
        risk_profile: (data as any).risk_profile ?? "medium",
      } as FullFinancialProfile);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return { profile, loading, refetch: fetchProfile };
};
