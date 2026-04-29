import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import type { FamilyMember } from "@/lib/finance";

const toMember = (d: any): FamilyMember => ({
  id: d.id,
  relation: d.relation,
  name: d.name,
  age: Number(d.age) || 0,
  monthly_income: Number(d.monthly_income) || 0,
  monthly_expenses: Number(d.monthly_expenses) || 0,
  investments: Number(d.investments) || 0,
  insurance_type: d.insurance_type || "none",
  education_goal: d.education_goal,
  education_target_year: d.education_target_year,
  monthly_medical_expense: Number(d.monthly_medical_expense) || 0,
  has_health_insurance: !!d.has_health_insurance,
  dependency_level: d.dependency_level,
});

export const useFamilyMembers = () => {
  const { user } = useAuth();
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    if (!user) { setMembers([]); setLoading(false); return; }
    setLoading(true);
    const { data } = await supabase
      .from("family_members")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at");
    setMembers((data || []).map(toMember));
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchAll(); }, [fetchAll]);
  return { members, loading, refetch: fetchAll };
};
