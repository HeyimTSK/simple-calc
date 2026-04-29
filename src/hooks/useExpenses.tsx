import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export type Expense = {
  id: string;
  date: string;
  category: string;
  amount: number;
  note: string | null;
  payment_method: string | null;
};

export const useExpenses = (sinceDays = 90) => {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    if (!user) { setExpenses([]); setLoading(false); return; }
    setLoading(true);
    const since = new Date();
    since.setDate(since.getDate() - sinceDays);
    const { data } = await supabase
      .from("expenses")
      .select("*")
      .eq("user_id", user.id)
      .gte("date", since.toISOString().slice(0, 10))
      .order("date", { ascending: false });
    setExpenses((data || []).map((d: any) => ({
      ...d, amount: Number(d.amount) || 0,
    })));
    setLoading(false);
  }, [user, sinceDays]);

  useEffect(() => { fetchAll(); }, [fetchAll]);
  return { expenses, loading, refetch: fetchAll };
};
