import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import type { Goal } from "@/lib/finance";

export const useGoals = () => {
  const { user } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    if (!user) { setGoals([]); setLoading(false); return; }
    setLoading(true);
    const { data } = await supabase
      .from("goals")
      .select("*")
      .eq("user_id", user.id)
      .order("target_year");
    setGoals((data || []).map((d: any) => ({
      id: d.id, type: d.type, name: d.name,
      target_year: Number(d.target_year),
      current_cost: Number(d.current_cost) || 0,
      inflation_rate: Number(d.inflation_rate) || 6,
      expected_return: Number(d.expected_return) || 10,
      current_savings: Number(d.current_savings) || 0,
      monthly_contribution: Number(d.monthly_contribution) || 0,
      linked_member_id: d.linked_member_id,
    })));
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchAll(); }, [fetchAll]);
  return { goals, loading, refetch: fetchAll };
};
